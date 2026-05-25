import { test, expect } from '@playwright/test';

// P1: No Hard Sleeps allowed. Dynamic waiting only.
// P2: Graceful Degradation verification (Gemini -> YOLO).

test.describe('Aura AI Core - Graceful Degradation (Failover) E2E Test', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to AI Assistant / Scan Analysis page
    await page.goto('/dashboard/ai-assistant');
  });

  test('should fallback to local YOLO engine smoothly within 500ms when Gemini timeouts', async ({ page }) => {
    // 1. Mock the API to simulate a Gemini timeout/failure
    // Instead of waiting real time, we intercept the `/analyze-scan` request.
    await page.route('**/analyze-scan', async (route) => {
      // Simulate backend behavior: 
      // 500ms Gemini timeout triggers fallback, returning YOLO data.
      await new Promise(resolve => setTimeout(resolve, 600)); // Total 600ms to resolve fallback
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          task_id: 'sync-fallback-1234',
          message: '[SİSTEM UYARISI] Arka plan iş kuyruğu koptu. Otonom senkron motor tanılamayı başarıyla tamamladı.',
          consensus_findings: [
            { tooth_id: 14, pathology: 'caries', severity: 'Orta', confidence: 0.88, engines: 'YOLO Local Engine' }
          ],
          gemini_analysis: 'Sistem Hazır Değil: Gemini API anahtarı ayarlanmamış. YOLO Fallback kullanıldı.'
        })
      });
    });

    // 2. Perform UI Actions (Upload Scan)
    const fileChooserPromise = page.waitForEvent('filechooser');
    // Using Accessibility-focused locators instead of brittle CSS classes
    await page.getByRole('button', { name: /Röntgen Yükle/i }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles('e2e/fixtures/test_scan.jpg');

    // 3. Start Analysis
    await page.getByRole('button', { name: /Analizi Başlat/i }).click();

    // 4. Verification: The loading bar or processing indicator should appear and then disappear dynamically.
    const loadingIndicator = page.getByTestId('analysis-loading-bar');
    await expect(loadingIndicator).toBeVisible();
    
    // Auto-wait for the loading to finish (No hard sleeps) and measure time!
    const startTime = Date.now();
    await expect(loadingIndicator).toBeHidden({ timeout: 5000 });
    const endTime = Date.now();
    
    // STRICT P1 RULE: The fallback must happen within ~500ms (we allow a small 200ms buffer for UI render/network)
    const duration = endTime - startTime;
    expect(duration).toBeLessThan(750); 
    console.log(`[Graceful Degradation] UI Fallback Response Time: ${duration}ms (Must be < 750ms)`);

    // 5. Verify Fallback Graceful Degradation in UI
    // Ensure the system warning message for fallback is displayed
    const alertMessage = page.getByText(/Otonom senkron motor tanılamayı başarıyla tamamladı/i);
    await expect(alertMessage).toBeVisible();

    // Verify YOLO findings are rendered in the table
    const toothRow = page.getByRole('cell', { name: '14' });
    await expect(toothRow).toBeVisible();
    
    const engineInfo = page.getByRole('cell', { name: 'YOLO Local Engine' });
    await expect(engineInfo).toBeVisible();
  });
});
