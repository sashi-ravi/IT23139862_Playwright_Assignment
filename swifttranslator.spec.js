import { test, expect } from '@playwright/test';

const URL = 'https://www.swifttranslator.com/';
const SINHALA_REGEX = /[\u0D80-\u0DFF]/;

test.describe('Positive Functional Test Cases – Singlish to Sinhala', () => {
	async function enterTextAndGetOutput(page, input) {
		await page.goto(URL, { waitUntil: 'domcontentloaded' });

		const inputBox = page
			.getByPlaceholder('Input Your Singlish Text Here.')
			.first();
		await expect(inputBox).toBeVisible({ timeout: 10000 });

		await inputBox.fill('');
		await inputBox.fill(input);

		const outputBox = page
			.locator('.card:has-text("Sinhala") .bg-slate-50')
			.first();
		await expect(outputBox).toBeVisible({ timeout: 10000 });

		// ✅ Stable wait: keep checking until Sinhala letters appear in output
		await expect
			.poll(
				async () => {
					const txt = await outputBox.textContent();
					return SINHALA_REGEX.test(txt || '');
				},
				{ timeout: 15000 },
			)
			.toBe(true);

		return (await outputBox.textContent()) || '';
	}

	// ---------- POSITIVE TEST CASES ----------

	test('Pos_Fun_0001 – Father went to work', async ({ page }) => {
		const output = await enterTextAndGetOutput(
			page,
			'thaaththaa job ekata giyaa',
		);

		// ✅ Check key Sinhala words (not full sentence)
		expect(output).toContain('තාත්තා');
		expect(output).toContain('ගියා');
	});

	test('Pos_Fun_0002 – Coming home after doing work', async ({ page }) => {
		const output = await enterTextAndGetOutput(
			page,
			'mama vaeda tikath karagena gedhara ennam',
		);

		// ✅ Key words only (stable)
		expect(output).toContain('මම');
		expect(output).toContain('වැඩ');
		expect(output).toContain('ගෙදර');
		// "එන්නම්" can appear in different spelling, so check a shorter root
		expect(output).toContain('එන්');
	});
});
