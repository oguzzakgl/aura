# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e\failover.spec.ts >> Aura AI Core - Graceful Degradation (Failover) E2E Test >> should fallback to local YOLO engine smoothly within 500ms when Gemini timeouts
- Location: e2e\failover.spec.ts:13:7

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/dashboard/ai-assistant", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | // P1: No Hard Sleeps allowed. Dynamic waiting only.
  4  | // P2: Graceful Degradation verification (Gemini -> YOLO).
  5  | 
  6  | test.describe('Aura AI Core - Graceful Degradation (Failover) E2E Test', () => {
  7  |   
  8  |   test.beforeEach(async ({ page }) => {
  9  |     // Navigate to AI Assistant / Scan Analysis page
> 10 |     await page.goto('/dashboard/ai-assistant');
     |                ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  11 |   });
  12 | 
  13 |   test('should fallback to local YOLO engine smoothly within 500ms when Gemini timeouts', async ({ page }) => {
  14 |     // 1. Mock the API to simulate a Gemini timeout/failure
  15 |     // Instead of waiting real time, we intercept the `/analyze-scan` request.
  16 |     await page.route('**/analyze-scan', async (route) => {
  17 |       // Simulate backend behavior: 
  18 |       // 500ms Gemini timeout triggers fallback, returning YOLO data.
  19 |       await new Promise(resolve => setTimeout(resolve, 600)); // Total 600ms to resolve fallback
  20 |       await route.fulfill({
  21 |         status: 200,
  22 |         contentType: 'application/json',
  23 |         body: JSON.stringify({
  24 |           status: 'success',
  25 |           task_id: 'sync-fallback-1234',
  26 |           message: '[SİSTEM UYARISI] Arka plan iş kuyruğu koptu. Otonom senkron motor tanılamayı başarıyla tamamladı.',
  27 |           consensus_findings: [
  28 |             { tooth_id: 14, pathology: 'caries', severity: 'Orta', confidence: 0.88, engines: 'YOLO Local Engine' }
  29 |           ],
  30 |           gemini_analysis: 'Sistem Hazır Değil: Gemini API anahtarı ayarlanmamış. YOLO Fallback kullanıldı.'
  31 |         })
  32 |       });
  33 |     });
  34 | 
  35 |     // 2. Perform UI Actions (Upload Scan)
  36 |     const fileChooserPromise = page.waitForEvent('filechooser');
  37 |     // Using Accessibility-focused locators instead of brittle CSS classes
  38 |     await page.getByRole('button', { name: /Röntgen Yükle/i }).click();
  39 |     const fileChooser = await fileChooserPromise;
  40 |     await fileChooser.setFiles('e2e/fixtures/test_scan.jpg');
  41 | 
  42 |     // 3. Start Analysis
  43 |     await page.getByRole('button', { name: /Analizi Başlat/i }).click();
  44 | 
  45 |     // 4. Verification: The loading bar or processing indicator should appear and then disappear dynamically.
  46 |     const loadingIndicator = page.getByTestId('analysis-loading-bar');
  47 |     await expect(loadingIndicator).toBeVisible();
  48 |     
  49 |     // Auto-wait for the loading to finish (No hard sleeps) and measure time!
  50 |     const startTime = Date.now();
  51 |     await expect(loadingIndicator).toBeHidden({ timeout: 5000 });
  52 |     const endTime = Date.now();
  53 |     
  54 |     // STRICT P1 RULE: The fallback must happen within ~500ms (we allow a small 200ms buffer for UI render/network)
  55 |     const duration = endTime - startTime;
  56 |     expect(duration).toBeLessThan(750); 
  57 |     console.log(`[Graceful Degradation] UI Fallback Response Time: ${duration}ms (Must be < 750ms)`);
  58 | 
  59 |     // 5. Verify Fallback Graceful Degradation in UI
  60 |     // Ensure the system warning message for fallback is displayed
  61 |     const alertMessage = page.getByText(/Otonom senkron motor tanılamayı başarıyla tamamladı/i);
  62 |     await expect(alertMessage).toBeVisible();
  63 | 
  64 |     // Verify YOLO findings are rendered in the table
  65 |     const toothRow = page.getByRole('cell', { name: '14' });
  66 |     await expect(toothRow).toBeVisible();
  67 |     
  68 |     const engineInfo = page.getByRole('cell', { name: 'YOLO Local Engine' });
  69 |     await expect(engineInfo).toBeVisible();
  70 |   });
  71 | });
  72 | 
```