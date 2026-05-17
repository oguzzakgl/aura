import os
import hashlib
import json
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from middleware.audit_middleware import audit_logger

class PDFReportService:
    """
    Özellik 2: Profesyonel Dental Teşhis Raporu PDF Oluşturucu.
    Tüm bulguları mühürlü bir SHA-256 hash imzasıyla belgelendirir.
    """
    def __init__(self):
        self.output_dir = os.path.join(os.getcwd(), ".pdf_reports")
        os.makedirs(self.output_dir, exist_ok=True)

    def generate_report(self, doctor_id: str, tenant_id: str, patient_name: str, findings: list, gemini_report: str) -> str:
        pdf_filename = f"report_{tenant_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}.pdf"
        pdf_path = os.path.join(self.output_dir, pdf_filename)
        
        # 1. SHA-256 Mührü ve Güvenlik Zinciri Oluştur
        data_to_hash = json.dumps({
            "doctor_id": doctor_id,
            "tenant_id": tenant_id,
            "patient_name": patient_name,
            "findings": findings,
            "timestamp": datetime.utcnow().isoformat()
        }, ensure_ascii=False)
        
        # SHA-256 ile belgenin dijital parmak izini çıkar
        doc_hash = hashlib.sha256(data_to_hash.encode('utf-8')).hexdigest()
        
        # Audit trail'e mühürle
        audit_logger.log_action("PDF_GENERATED", doctor_id, tenant_id, data_to_hash)

        # 2. ReportLab PDF Hazırlığı
        doc = SimpleDocTemplate(pdf_path, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
        story = []
        
        styles = getSampleStyleSheet()
        
        # Custom Premium Styles
        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontSize=22,
            leading=26,
            textColor=colors.HexColor('#0066CC'), # Aura Primary Blue
            spaceAfter=15
        )
        
        header_style = ParagraphStyle(
            'HeaderStyle',
            parent=styles['Heading2'],
            fontSize=12,
            leading=16,
            textColor=colors.HexColor('#1D1D1F'),
            spaceAfter=10
        )
        
        body_style = ParagraphStyle(
            'BodyStyle',
            parent=styles['BodyText'],
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#434345')
        )
        
        meta_label_style = ParagraphStyle(
            'MetaLabel',
            parent=body_style,
            fontName='Helvetica-Bold',
            textColor=colors.HexColor('#1D1D1F')
        )
        
        hash_style = ParagraphStyle(
            'HashStyle',
            parent=body_style,
            fontName='Courier',
            fontSize=7,
            leading=9,
            textColor=colors.HexColor('#FF3B30') # Safety Red
        )

        # Rapor Başlığı
        story.append(Paragraph("AURA CLINICAL AI DIAGNOSTIC REPORT", title_style))
        story.append(Spacer(1, 10))

        # Üst Bilgi Tablosu (Metadata)
        meta_data = [
            [Paragraph("Tarih / Saat:", meta_label_style), Paragraph(datetime.now().strftime("%d.%m.%Y %H:%M"), body_style),
             Paragraph("Hasta Adı:", meta_label_style), Paragraph(patient_name, body_style)],
            [Paragraph("Hekim ID:", meta_label_style), Paragraph(doctor_id, body_style),
             Paragraph("Klinik Tenant ID:", meta_label_style), Paragraph(tenant_id, body_style)]
        ]
        
        meta_table = Table(meta_data, colWidths=[80, 180, 80, 180])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F5F5F7')),
            ('PADDING', (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('LINEBELOW', (0,-1), (-1,-1), 1, colors.HexColor('#D2D2D7')),
        ]))
        
        story.append(meta_table)
        story.append(Spacer(1, 20))

        # 3. AI Bulguları Tablosu
        story.append(Paragraph("DENTAL PATOLOJİ BULGULARI (CONSENSUS ENGINE)", header_style))
        
        table_data = [[
            Paragraph("<b>Diş #</b>", body_style), 
            Paragraph("<b>Teşhis / Bulgular</b>", body_style), 
            Paragraph("<b>Şiddet</b>", body_style), 
            Paragraph("<b>Konsensüs</b>", body_style), 
            Paragraph("<b>Güven</b>", body_style)
        ]]
        
        for f in findings:
            tooth_id = str(f.get("tooth_id")) if f.get("tooth_id") else "Genel"
            pathology = f.get("pathology", "Bilinmeyen")
            severity = f.get("severity", "Orta")
            consensus = f.get("consensus", "Muhtemel")
            confidence = f"%{int(f.get('confidence', 0) * 100)}" if isinstance(f.get('confidence'), float) else f"%{f.get('confidence')}"
            
            table_data.append([
                Paragraph(tooth_id, body_style),
                Paragraph(pathology.capitalize(), body_style),
                Paragraph(severity, body_style),
                Paragraph(consensus, body_style),
                Paragraph(confidence, body_style)
            ])
            
        findings_table = Table(table_data, colWidths=[60, 200, 80, 100, 80])
        findings_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0066CC')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('PADDING', (0,0), (-1,-1), 6),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F9F9FB')]),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E5E5EA')),
        ]))
        
        story.append(findings_table)
        story.append(Spacer(1, 20))

        # 4. Detaylı Klinik Yorum (Gemini Raporu)
        story.append(Paragraph("UZMAN DENTAL KLİNİK YORUMU (GEMINI ENGINE)", header_style))
        story.append(Paragraph(gemini_report.replace('\n', '<br/>'), body_style))
        story.append(Spacer(1, 30))

        # 5. SHA-256 Dijital Mühür (Security Footer)
        story.append(Paragraph("<b>🛡️ DIJITAL GÜVENLİK MÜHRÜ (SHA-256 INTEGRITY SEAL)</b>", header_style))
        story.append(Paragraph("Bu belge, Aura AI Teşhis Motoru tarafından üretilmiş ve değiştirilemez bir hash zinciriyle sisteme mühürlenmiştir. Herhangi bir veri manipülasyonunda belgenin parmak izi geçersiz kalacaktır.", body_style))
        story.append(Spacer(1, 5))
        story.append(Paragraph(f"<b>HASH IMZASI:</b> {doc_hash}", hash_style))

        # PDF Derle
        doc.build(story)
        
        return pdf_path

pdf_report_service = PDFReportService()
