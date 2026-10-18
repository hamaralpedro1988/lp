"""V5.8 counter, semantic outcome colors and full-surface composer interaction checks."""
import argparse
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
parser=argparse.ArgumentParser();parser.add_argument('--url',default='http://127.0.0.1:5181');parser.add_argument('--screenshots',default='work/v58/refinement');args=parser.parse_args();out=Path(args.screenshots);out.mkdir(parents=True,exist_ok=True)
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=b.new_page()
 for width in [320,390,419]:
  page.set_viewport_size({'width':width,'height':844});page.goto(args.url+'/?version=5&systemChrome=preview');page.locator('.screen').wait_for()
  page.evaluate('()=>localStorage.setItem("lp-rosa-flow-v5-v01",JSON.stringify({screen:"assessment",index:1,answers:{1:"met"},notes:{}}))');page.reload();page.locator('.spatial-live-card').wait_for()
  expect(page.locator('.spatial-position')).to_have_text('2 of 11');expect(page.locator('.spatial-choice .lucide-check')).to_have_count(0)
  expect(page.get_by_role('radio',name='Pass',exact=True)).to_be_checked()
  page.evaluate('() => Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{})))')
  green=page.locator('.spatial-choice[data-outcome=met]').evaluate('e=>({background:getComputedStyle(e).backgroundColor,border:getComputedStyle(e).borderColor,radio:getComputedStyle(e.querySelector("[role=radio]")).color})')
  page.evaluate('()=>{for(const [k,v] of Object.entries({"--spatial-brand-iris":"#c60024","--spatial-brand-selection":"#ffe0e5","--spatial-brand-selected-line":"#c60024","--primary":"#c60024"}))document.documentElement.style.setProperty(k,v)}')
  page.evaluate('() => Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{})))')
  assert green==page.locator('.spatial-choice[data-outcome=met]').evaluate('e=>({background:getComputedStyle(e).backgroundColor,border:getComputedStyle(e).borderColor,radio:getComputedStyle(e.querySelector("[role=radio]")).color})'),'Pass must remain semantic green under red branding'
  page.evaluate('()=>{for(const k of ["--spatial-brand-iris","--spatial-brand-selection","--spatial-brand-selected-line","--primary"])document.documentElement.style.removeProperty(k)}')
  card=page.locator('.spatial-live-card');card.evaluate('e=>e.scrollTop=e.scrollHeight')
  expect(page.locator('.spatial-composer-help')).to_have_count(0)
  expect(page.locator('.spatial-composer')).not_to_contain_text('Optional evidence')
  field=page.get_by_role('textbox',name='Comment',exact=True);box=field.bounding_box();camera=page.get_by_role('button',name='Add photo',exact=True).bounding_box()
  assert camera['y']-box['y']<=12,'camera must sit at the top of the field'
  page.mouse.click(box['x']+20,box['y']+box['height']-12);expect(field).to_be_focused();page.keyboard.type('Observed safe station setup.');expect(field).to_have_value('Observed safe station setup.')
  page.evaluate('document.fonts.ready');page.evaluate('() => Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{})))');page.screenshot(path=str(out/f'pass-composer-{width}.png'))
  page.get_by_role('radio',name='Fail',exact=True).check();expect(page.get_by_role('radio',name='Fail',exact=True)).to_be_checked();expect(page.locator('.spatial-choice .lucide-check')).to_have_count(0)
  page.screenshot(path=str(out/f'fail-{width}.png'))
  page.get_by_role('button',name='Add photo',exact=True).click();expect(page.get_by_role('dialog')).to_have_count(1);page.keyboard.press('Escape');expect(page.get_by_role('button',name='Add photo',exact=True)).to_be_focused()
  page.get_by_role('button',name='Sections',exact=True).click();page.locator('.spatial-criterion-link').nth(8).click();expect(page.get_by_role('dialog')).to_have_count(0);page.evaluate('() => Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{})))');card.evaluate('e=>e.scrollTop=e.scrollHeight');expect(page.locator('.spatial-composer-help')).to_have_text('Comment and photo required')
  field=page.get_by_role('textbox',name='Comment',exact=True);helpbox=page.locator('.spatial-composer-help').bounding_box();page.mouse.click(helpbox['x']+5,helpbox['y']+5);expect(field).to_be_focused()
  field.fill('Finished quality observed.');expect(page.locator('.spatial-composer-help')).to_have_text('Photo required');expect(page.get_by_role('button',name='Next',exact=True)).to_be_disabled();page.screenshot(path=str(out/f'required-{width}.png'))
  print(f'PASS semantic green independent of red brand, counters, no ticks, whole-field focus and top camera at {width}px',flush=True)
 b.close()
