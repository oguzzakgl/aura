-- ====================================================================================
-- MIGRATION: 20260521000000_rls_and_double_booking.sql
-- PURPOSE: Core Tables, GiST Exclusion for Double Booking, RBAC (Role-Based Access Control)
--          Leave Management (İzin Sistemi) & Automatic Appointment Cancellation
-- AUTHOR: Antigravity (Senior Database Architect / role_database_expert.md)
-- ====================================================================================

-- 1. Eklentileri (Extensions) Aktif Etme
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist"; -- P1: Veri bütünlüğü için GiST gereklidir.

-- 2. Temel Tabloları (Core Tables) Oluşturma
-- 2.a Clinics (Klinikler / Tenant)
CREATE TABLE IF NOT EXISTS clinics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.b Doctors (Doktorlar / Personel)
CREATE TABLE IF NOT EXISTS doctors (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'doktor' CHECK (role IN ('yonetici', 'doktor')), -- RBAC eklentisi
    full_name VARCHAR(255) NOT NULL,
    specialty VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.c Patients (Hastalar)
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    tc_kimlik VARCHAR(11), 
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.d Appointments (Randevular)
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    appointment_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 30,
    status VARCHAR(50) NOT NULL DEFAULT 'Onaylı',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.e Leave Requests (İzin Talepleri)
CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Bekliyor' CHECK (status IN ('Bekliyor', 'Onaylandı', 'Reddedildi')),
    auto_cancel_appointments BOOLEAN NOT NULL DEFAULT FALSE, -- Yöneticinin onaylarken vereceği otomatik iptal kararı
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.f Notifications Outbox (Mesaj Gönderim Kuyruğu)
-- Supabase Webhook veya Backend'in SMS/Email göndermek için dinleyeceği kuyruk tablosu
CREATE TABLE IF NOT EXISTS notifications_outbox (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    message_type VARCHAR(50) NOT NULL, -- Örn: 'SMS'
    content TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. İndeksleme Stratejisi (P3: Performans ve Yavaş Sorgu Engelleme)
CREATE INDEX IF NOT EXISTS idx_patients_tenant_id ON patients USING btree(tenant_id);
CREATE INDEX IF NOT EXISTS idx_appointments_tenant_id ON appointments USING btree(tenant_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments USING btree(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_time ON appointments USING btree(appointment_time);
CREATE INDEX IF NOT EXISTS idx_doctors_role ON doctors USING btree(role);


-- 4. KESİN SINIR 1: Veri Bütünlüğü ve Çifte Randevu (Double Booking) Koruması
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS no_double_booking;
ALTER TABLE appointments 
ADD CONSTRAINT no_double_booking 
EXCLUDE USING gist (
    doctor_id WITH =, 
    tstzrange(appointment_time, appointment_time + (duration_minutes || ' minutes')::interval) WITH &&
) WHERE (status NOT IN ('İptal', 'İptal (Doktor İzni)', 'Gelmedi'));


-- 5. P1: ZERO-TRUST RLS (Row Level Security) Politikaları
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications_outbox ENABLE ROW LEVEL SECURITY;

-- Fonksiyon: Kullanıcının Yöneticisi Olduğu Kliniği Getir (Performans için)
CREATE OR REPLACE FUNCTION get_admin_tenant_id() RETURNS UUID AS $$
    SELECT tenant_id FROM doctors WHERE id = auth.uid() AND role = 'yonetici' LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- 5.a Clinics RLS
CREATE POLICY "Klinik erişimi" ON clinics FOR SELECT USING (id = (SELECT tenant_id FROM doctors WHERE id = auth.uid()));

-- 5.b Doctors RLS
CREATE POLICY "Doktorlar kendi kliniğindeki personeli görebilir" ON doctors FOR SELECT USING (tenant_id = (SELECT tenant_id FROM doctors WHERE id = auth.uid()));

-- 5.c Patients RLS
CREATE POLICY "Hastaları sadece klinik görebilir" ON patients FOR SELECT USING (tenant_id = (SELECT tenant_id FROM doctors WHERE id = auth.uid()));
CREATE POLICY "Hastaları sadece klinik ekleyebilir" ON patients FOR INSERT WITH CHECK (tenant_id = (SELECT tenant_id FROM doctors WHERE id = auth.uid()));
CREATE POLICY "Hastaları sadece klinik güncelleyebilir" ON patients FOR UPDATE USING (tenant_id = (SELECT tenant_id FROM doctors WHERE id = auth.uid()));

-- 5.d Appointments RLS (RBAC: Doktorlar sadece kendi, Yöneticiler ise hepsini görür)
CREATE POLICY "Randevu Görme Yetkisi" ON appointments FOR SELECT 
USING (
    doctor_id = auth.uid() -- Doktor sadece kendi randevusunu görür
    OR 
    tenant_id = get_admin_tenant_id() -- Yönetici kliniğin tamamını görür
);

CREATE POLICY "Randevu Ekleme Yetkisi" ON appointments FOR INSERT 
WITH CHECK (
    doctor_id = auth.uid() 
    OR 
    tenant_id = get_admin_tenant_id()
);

CREATE POLICY "Randevu Güncelleme Yetkisi" ON appointments FOR UPDATE 
USING (
    doctor_id = auth.uid() 
    OR 
    tenant_id = get_admin_tenant_id()
);

-- 5.e Leave Requests RLS
CREATE POLICY "İzin Talep Görme" ON leave_requests FOR SELECT USING (doctor_id = auth.uid() OR tenant_id = get_admin_tenant_id());
CREATE POLICY "İzin Talep Ekleme" ON leave_requests FOR INSERT WITH CHECK (doctor_id = auth.uid());
CREATE POLICY "İzin Talep Güncelleme" ON leave_requests FOR UPDATE USING (tenant_id = get_admin_tenant_id()); -- Sadece yönetici güncelleyebilir/onaylayabilir


-- 6. İZİN ONAYLANDIĞINDA OTOMATİK İPTAL VE SMS (TRIGGER)
CREATE OR REPLACE FUNCTION process_leave_approval()
RETURNS TRIGGER AS $$
DECLARE
    appt_record RECORD;
BEGIN
    -- Sadece 'Bekliyor' durumundan 'Onaylandı' durumuna geçerken ve auto_cancel_appointments TRUE ise çalış
    IF NEW.status = 'Onaylandı' AND OLD.status = 'Bekliyor' AND NEW.auto_cancel_appointments = TRUE THEN
        
        -- O tarihteki tüm çakışan randevuları bul ve iptal et
        FOR appt_record IN 
            SELECT a.id, a.patient_id, p.full_name, a.appointment_time
            FROM appointments a
            JOIN patients p ON p.id = a.patient_id
            WHERE a.doctor_id = NEW.doctor_id
              AND a.status = 'Onaylı'
              AND a.appointment_time >= NEW.start_time
              AND a.appointment_time <= NEW.end_time
        LOOP
            -- 1. Randevuyu İptal Et
            UPDATE appointments 
            SET status = 'İptal (Doktor İzni)' 
            WHERE id = appt_record.id;
            
            -- 2. Hastaya SMS gönderilmesi için Outbox'a kayıt at (Backend bunu dinleyip SMS atacak)
            INSERT INTO notifications_outbox (tenant_id, patient_id, message_type, content)
            VALUES (
                NEW.tenant_id, 
                appt_record.patient_id, 
                'SMS', 
                'Sayın ' || appt_record.full_name || ', ' || to_char(appt_record.appointment_time, 'DD/MM/YYYY HH24:MI') || ' tarihli randevunuz doktorumuzun acil izni nedeniyle iptal edilmiştir. Yeni randevu için lütfen kliniğimizle iletişime geçiniz.'
            );
        END LOOP;
        
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_leave_approval ON leave_requests;
CREATE TRIGGER trigger_leave_approval
AFTER UPDATE OF status ON leave_requests
FOR EACH ROW
EXECUTE FUNCTION process_leave_approval();
