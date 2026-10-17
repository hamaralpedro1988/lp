"""End-to-end V5 / V4 checks. Requires Python Playwright and a local Chromium.
Run the Vite dev server, then:
  python scripts/check-spatial.py --screenshots docs/rosa-v5/screenshots
"""
import argparse
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

parser = argparse.ArgumentParser()
parser.add_argument('--url', default='http://127.0.0.1:5173')
parser.add_argument('--chromium', default='/usr/bin/chromium')
parser.add_argument('--screenshots', default='work/rosa-v5/screenshots')
args = parser.parse_args()
shots = Path(args.screenshots)
shots.mkdir(parents=True, exist_ok=True)
scratch = Path('work/rosa-v5')
scratch.mkdir(parents=True, exist_ok=True)
KEY = 'lp-rosa-flow-v5-v01'

with sync_playwright() as pw:
    browser = pw.chromium.launch(executable_path=args.chromium, headless=True, args=['--no-sandbox'])
    context = browser.new_context(viewport={'width': 390, 'height': 844})
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))

    def settle():
        page.evaluate("() => Promise.all(document.getAnimations().map(a => a.finished.catch(() => {})))")

    def capture(name):
        settle()
        page.mouse.move(1, 1)
        page.screenshot(path=str(shots / (name + '.png')))

    def count_complete(number):
        expect(page.get_by_role('progressbar', name='Criteria complete')).to_have_attribute('aria-valuenow', str(number))

    def open_note(text):
        page.get_by_role('button', name='Add comment', exact=True).click()
        expect(page.get_by_role('dialog')).to_be_visible()
        page.get_by_role('textbox', name='Your note', exact=True).fill(text)

    page.goto(args.url + '/?version=5')
    expect(page.get_by_role('heading', name='Your assessments', exact=True)).to_be_visible()
    assert page.locator('.phone').get_by_role('button', name='Save', exact=True).count() == 0
    capture('01-assignments-mobile')
    page.get_by_role('button', name='View Assessment', exact=True).click()
    expect(page.get_by_role('heading', name='Fryer Station', exact=True)).to_be_visible()
    capture('02-overview-mobile')
    member = page.get_by_role('button', name='View team member Dre Jackson')
    member.click()
    page.get_by_role('button', name='Back to overview', exact=True).click()
    expect(member).to_be_focused()
    page.get_by_role('button', name='Start Assessment', exact=True).click()
    count_complete(0)
    expect(page.get_by_role('button', name='Next', exact=True)).to_be_disabled()
    expect(page.get_by_role('radio', name='Pass', exact=True)).not_to_be_checked()
    page.get_by_role('radio', name='Pass', exact=True).focus()
    page.keyboard.press('ArrowDown')
    expect(page.get_by_role('radio', name='Needs coaching', exact=True)).to_be_checked()
    expect(page.locator('#live-question-title')).to_contain_text('Prepares a safe')
    count_complete(1)
    capture('03-live-selection-mobile')
    page.keyboard.press('Home')
    expect(page.get_by_role('radio', name='Pass', exact=True)).to_be_checked()
    page.get_by_role('button', name='Next', exact=True).click()
    expect(page.locator('#live-question-title')).to_be_focused()
    expect(page.get_by_role('button', name='Next', exact=True)).to_be_disabled()
    expect(page.locator('.spatial-live-card')).to_have_attribute('data-direction', 'next')
    page.get_by_role('button', name='Previous criterion', exact=True).click()
    expect(page.locator('.spatial-live-card')).to_have_attribute('data-direction', 'back')
    expect(page.get_by_role('radio', name='Pass', exact=True)).to_be_checked()

    sections = page.get_by_role('button', name='Sections', exact=True)
    sections.click()
    expect(page.locator('.spatial-criterion-link')).to_have_count(11)
    capture('04-sections-mobile')
    page.locator('.spatial-criterion-link').nth(8).click()
    expect(page.locator('#live-question-title')).to_contain_text('finished product')
    expect(page.locator('#live-question-title')).to_be_focused()
    page.get_by_role('radio', name='Fail', exact=True).check()
    count_complete(1)  # Answer alone does not complete a required-evidence criterion.
    expect(page.locator('.inline-evidence-action[data-evidence-pending=true]')).to_have_count(2)
    page.get_by_role('button', name='Add photo', exact=True).click()
    capture('05-photo-sheet-mobile')
    # Exercise a real file input, real preview and count; no demo attachment state.
    fixture = scratch / 'photo-fixture.png'
    page.screenshot(path=str(fixture))
    page.locator('input[aria-label="Take photo"]').nth(8).set_input_files(str(fixture))
    page.keyboard.press('Escape')
    expect(page.locator('.flow-gallery img')).to_have_count(1)
    count_complete(2)
    page.locator('.flow-gallery button[aria-label^="Preview"]').click()
    expect(page.get_by_role('heading', name='Evidence preview')).to_be_visible()
    page.keyboard.press('Escape')
    page.get_by_role('button', name='Remove photo-fixture.png', exact=True).click()
    count_complete(1)
    # A fresh attachment can never survive a reload as verified evidence.
    page.get_by_role('button', name='Add photo', exact=True).click()
    page.locator('input[aria-label="Take photo"]').nth(8).set_input_files(str(fixture))
    page.keyboard.press('Escape')
    count_complete(2)
    page.reload()
    count_complete(1)
    expect(page.locator('.flow-gallery img')).to_have_count(0)
    expect(page.get_by_role('radio', name='Fail', exact=True)).to_be_checked()
    open_note('Observed the finished product quality against the station standard.')
    capture('06-comment-sheet-mobile')
    # Preserve unsaved-change handling and accessible confirmation.
    page.get_by_role('button', name='Cancel', exact=True).click()
    expect(page.get_by_role('alertdialog')).to_be_visible()
    page.get_by_role('button', name='Keep editing', exact=True).click()
    page.get_by_role('button', name='Save', exact=True).click()
    expect(page.get_by_role('button', name='Edit comment', exact=True)).to_be_focused()
    count_complete(2)
    expect(page.locator('.inline-evidence-action[data-evidence-pending=true]')).to_have_count(0)

    sections.click()
    page.get_by_role('button', name='Review all', exact=True).click()
    expect(page.get_by_role('button', name='Continue to feedback & sign-off')).to_be_disabled()
    capture('07-review-incomplete-mobile')
    page.get_by_role('button', name='Edit: Prepares a safe, clean work area', exact=True).click()
    # No automatic advance; navigation remains explicit through all 11 criteria.
    for index in range(11):
        outcome = 'Fail' if index == 8 else 'Needs coaching' if index in (4, 5) else 'Pass'
        page.get_by_role('radio', name=outcome, exact=True).check()
        expect(page.locator('.criterion-position')).to_contain_text(f'Criterion {index + 1} / 11')
        page.get_by_role('button', name='Review' if index == 10 else 'Next', exact=True).click()
    expect(page.get_by_role('heading', name='Review observations', exact=True)).to_be_visible()
    expect(page.get_by_role('button', name='Edit:', exact=False)).to_have_count(11)
    expect(page.get_by_role('button', name='Continue to feedback & sign-off')).to_be_enabled()
    capture('08-review-complete-mobile')
    page.get_by_role('button', name='Continue to feedback & sign-off').click()
    expect(page.get_by_role('heading', name='Share feedback', exact=True)).to_be_visible()
    assert page.locator('.approval-row').count() == 2, 'No universal manager requirement'
    page.get_by_role('textbox', name='Coaching / feedback note').fill('Review safe basket handling and programme selection with Dre.')
    capture('09-signoff-mobile')
    page.get_by_role('button', name='Confirm assessor review').click()
    expect(page.get_by_role('heading', name='Assessor review recorded · demo')).to_be_visible()
    expect(page.get_by_role('dialog')).to_contain_text('Not certified yet')
    capture('10-confirmation-mobile')
    page.get_by_role('button', name='Done for now').click()
    expect(page.locator('.overview-status')).to_contain_text('Review recorded · demo')
    saved = page.evaluate('(key) => localStorage.getItem(key)', KEY)
    page.reload()
    expect(page.locator('.overview-status')).to_contain_text('Review recorded · demo')

    # Breakpoint and reduced-height checks of every stage, not just the checklist.
    for width in [320, 375, 390, 430, 1440]:
        page.set_viewport_size({'width': width, 'height': 844})
        for screen in ['list', 'overview', 'assessment', 'review', 'signoff']:
            page.evaluate("""args => { const draft = JSON.parse(args.saved); draft.screen = args.screen; draft.index = 8; localStorage.setItem(args.key, JSON.stringify(draft)); }""", {'saved': saved, 'screen': screen, 'key': KEY})
            page.reload()
            page.locator('.screen').wait_for()
            settle()
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (width, screen, 'page overflow')
            assert page.locator('.screen').evaluate('(e) => e.scrollWidth <= e.clientWidth'), (width, screen, 'screen overflow')
            frame = page.locator('.phone').bounding_box()
            assert frame['y'] + frame['height'] <= 845, (width, screen, 'navigation below viewport')
            if width == 1440:
                capture('desktop-' + screen)
            if width == 320 and screen == 'assessment':
                capture('11-narrow-mobile')
        print(f'PASS responsive all five screens: {width}px')

    # Truthful offline/save failure, reduced motion and larger copy.
    page.set_viewport_size({'width': 390, 'height': 520})
    page.evaluate("""key => { const d=JSON.parse(localStorage.getItem(key)); d.screen='assessment'; d.offline=true; localStorage.setItem(key,JSON.stringify(d)); }""", KEY)
    page.reload()
    expect(page.locator('.spatial-progress-copy')).to_contain_text('Offline · local draft')
    capture('12-offline-mobile')
    page.get_by_role('button', name='Edit comment', exact=True).click()
    dialog = page.get_by_role('dialog')
    expect(dialog).to_be_visible()
    assert dialog.bounding_box()['height'] <= 520
    page.keyboard.press('Escape')
    expect(page.get_by_role('button', name='Edit comment', exact=True)).to_be_focused()
    page.emulate_media(reduced_motion='reduce')
    page.get_by_role('button', name='Previous criterion', exact=True).click()
    assert page.locator('.spatial-live-card').evaluate('(e) => getComputedStyle(e).animationName') == 'none'
    assert page.evaluate("document.getAnimations().filter(a => a.effect.getComputedTiming().iterations === Infinity).length") == 0
    page.add_style_tag(content='.flow-v5 .criterion-desc,.flow-v5 .choice-copy small {font-size:20px!important} .flow-v5 .criterion-title {font-size:30px!important}')
    assert page.locator('.screen').evaluate('(e) => e.scrollWidth <= e.clientWidth')
    page.evaluate("() => { Storage.prototype.setItem = function() { throw new Error('Test storage failure') }; }")
    page.get_by_role('radio', name='Fail', exact=True).check()
    expect(page.get_by_role('alert')).to_contain_text('Local save unavailable')
    expect(page.locator('.spatial-progress-copy')).to_contain_text('Local save unavailable')

    saved_before_regression = page.evaluate('(key) => localStorage.getItem(key)', KEY)

    # V4 and V2/V3 regression: no inherited V5 colors, layout or draft writes.
    for version in [2, 3, 4]:
        page.goto(args.url + f'/?version={version}')
        page.get_by_role('button', name='Start Assessment', exact=True).click()
        expect(page.get_by_role('button', name='Next', exact=True)).to_be_disabled()
        expect(page.get_by_role('radio', name='Pass', exact=True)).not_to_be_checked()
        page.get_by_role('radio', name='Pass', exact=True).check()
        page.get_by_role('button', name='Next', exact=True).click()
        expect(page.locator('.criterion-position')).to_contain_text('Criterion 2 / 11')
        expect(page.get_by_role('button', name='Next', exact=True)).to_be_disabled()
        assert page.locator('.flow-v5').count() == 0
        if version == 3:
            expect(page.locator('.evidence-fab-dock')).to_be_visible()
        if version == 4:
            expect(page.locator('.inline-evidence-actions')).to_be_visible()
            assert page.locator('.phone').evaluate('(e) => getComputedStyle(e).backgroundColor') == 'rgb(247, 248, 248)'
        assert page.evaluate('(key) => localStorage.getItem(key)', KEY) == saved_before_regression
    assert not errors, errors
    print('PASS: full V5 flow, real evidence, reload, missing-evidence gate, sign-off, motion, offline/error, keyboard/focus and V2–V4 regressions.')
    browser.close()
