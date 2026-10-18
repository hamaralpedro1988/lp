"""Verify whole-card button transitions, re-entry guards and reduced motion in React V5."""
import argparse
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
parser = argparse.ArgumentParser()
parser.add_argument('--url', default='http://127.0.0.1:5181')
parser.add_argument('--screenshots', default='work/card-motion')
args = parser.parse_args()
out = Path(args.screenshots)
out.mkdir(parents=True, exist_ok=True)
with sync_playwright() as pw:
    browser = pw.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    page = browser.new_page(viewport={'width': 390, 'height': 844})
    page.add_init_script('''
      window.cardMotion = [];
      const original = Element.prototype.animate;
      Element.prototype.animate = function(frames, options) {
        if (this.classList.contains('spatial-live-card')) window.cardMotion.push(frames);
        return original.call(this, frames, options);
      };
    ''')
    page.goto(args.url + '/?version=5&brandDemo=1&brand=mcdonalds')
    page.locator('.screen').wait_for()
    page.get_by_role('button', name='View Assessment', exact=True).click()
    page.get_by_role('button', name='Start Assessment', exact=True).click()
    page.get_by_role('radio', name='Pass', exact=True).check()
    page.get_by_role('textbox', name='Comment', exact=True).fill('Preserve this note through the animation.')
    # Three synchronous requests must commit one navigation only.
    page.get_by_role('button', name='Next', exact=True).evaluate('(e)=>{e.click();e.click();e.click()}')
    page.wait_for_function('document.querySelector("[data-card-departure]")')
    midpoint = page.evaluate("""() => {
      const cards = [...document.querySelectorAll('.spatial-live-card')];
      for (const card of cards) for (const animation of card.getAnimations()) {
        animation.pause();
        const duration = animation.effect.getTiming().duration;
        if (duration !== 500) throw new Error('Expected 500ms card transition, got '+duration);
        animation.currentTime = duration * .5;
      }
      return cards.map(card => ({x:card.getBoundingClientRect().x, width:card.offsetWidth}));
    }""")
    page.screenshot(path=str(out / 'simultaneous-midpoint.png'))
    assert len(midpoint) == 2
    assert all(card['x'] < 390 and card['x'] + card['width'] > 0 for card in midpoint), midpoint
    assert page.locator('[data-card-departure]').evaluate('e=>e.inert && e.getAttribute("aria-hidden")==="true"')
    expect(page.get_by_role('textbox', name='Comment', exact=True)).to_have_count(1)
    page.evaluate('document.getAnimations().forEach(a=>a.finish())')
    expect(page.locator('.spatial-live-card:not([data-card-departure]) .spatial-position')).to_have_text('2 of 11')
    page.wait_for_function("!document.querySelector('.spatial-live-card').dataset.swipe")
    frames = page.evaluate('window.cardMotion')
    assert len(frames) == 2, frames
    assert frames[0][-1]['transform'].startswith('translateX(-')
    assert not frames[1][0]['transform'].startswith('translateX(-')
    assert frames[0][-1]['transform'].endswith('scale(0.98)')
    assert 'scale(' not in frames[1][0]['transform']
    assert frames[0][-1]['opacity'] == frames[1][0]['opacity'] == 1
    page.get_by_role('button', name='Previous criterion', exact=True).click()
    expect(page.locator('.spatial-live-card:not([data-card-departure]) .spatial-position')).to_have_text('1 of 11')
    page.wait_for_function("!document.querySelector('.spatial-live-card').dataset.swipe")
    frames = page.evaluate('window.cardMotion')
    assert len(frames) == 4
    assert not frames[2][-1]['transform'].startswith('translateX(-')
    assert frames[3][0]['transform'].startswith('translateX(-')
    expect(page.get_by_role('textbox', name='Comment', exact=True)).to_have_value('Preserve this note through the animation.')
    page.emulate_media(reduced_motion='reduce')
    page.get_by_role('button', name='Next', exact=True).click()
    expect(page.locator('.spatial-live-card:not([data-card-departure]) .spatial-position')).to_have_text('2 of 11')
    assert page.evaluate('window.cardMotion.length') == 4
    expect(page.get_by_role('button', name='Next', exact=True)).to_be_disabled()
    expect(page.locator('[data-card-departure]')).to_have_count(0)
    print('PASS simultaneous 500ms card slides with 98% exit depth in both directions, rapid-click guard, saved note, unanswered guard and reduced motion')
    browser.close()
