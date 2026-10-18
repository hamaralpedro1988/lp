"""Check modal portals stay inside the participant device and remain usable."""
import argparse
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
parser=argparse.ArgumentParser();parser.add_argument('--url',default='http://127.0.0.1:5181');parser.add_argument('--screenshots',default='work/navigation/overlays');args=parser.parse_args();out=Path(args.screenshots);out.mkdir(parents=True,exist_ok=True)
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=browser.new_page()
 def settle():
  page.evaluate('document.fonts.ready');page.evaluate('() => Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{})))')
 def bounds(label):
  settle()
  expect(page.locator('.device-overlay-root [role=dialog]')).to_be_visible()
  result=page.evaluate('''() => {
   const root=document.querySelector('.device-overlay-root').getBoundingClientRect();
   return [...document.querySelectorAll('.device-overlay-root [data-slot=sheet-overlay],.device-overlay-root [data-slot=sheet-content]')].filter(e=>e.dataset.state==='open').map(e=>{
    const b=e.getBoundingClientRect();return {slot:e.dataset.slot,inside:b.left>=root.left-1&&b.right<=root.right+1&&b.top>=root.top-1&&b.bottom<=root.bottom+1};
   });
  }''')
  assert result and all(x['inside'] for x in result),(label,result)
  page.screenshot(path=str(out/f'{label}.png'))
 for width in [320,390,1440]:
  page.set_viewport_size({'width':width,'height':844});page.goto(args.url+'/?version=5');page.locator('.screen').wait_for()
  page.evaluate('()=>localStorage.removeItem("lp-rosa-flow-v5-v01")');page.reload()
  page.get_by_role('button',name='View Assessment',exact=True).click()
  page.get_by_role('button',name='View team member Dre Jackson').click();bounds(f'member-{width}')
  page.keyboard.press('Escape');expect(page.get_by_role('button',name='View team member Dre Jackson')).to_be_focused()
  page.get_by_role('button',name='Start Assessment',exact=True).click()
  page.get_by_role('button',name='Sections',exact=True).click();bounds(f'sections-{width}')
  expect(page.locator('.spatial-criterion-link')).to_have_count(11)
  page.locator('.spatial-criterion-link').nth(10).click();expect(page.locator('.spatial-position')).to_have_text('11 of 11');expect(page.locator('#live-question-title')).to_be_focused()
  page.get_by_role('button',name='Sections',exact=True).click();page.keyboard.press('Escape');expect(page.get_by_role('button',name='Sections',exact=True)).to_be_focused()
  page.get_by_role('button',name='Add photo',exact=True).click();bounds(f'photo-{width}');page.keyboard.press('Escape');expect(page.get_by_role('button',name='Add photo',exact=True)).to_be_focused()
  if width==1440:
   page.get_by_role('button',name='Sections',exact=True).click();page.set_viewport_size({'width':1000,'height':650});bounds('sections-resized-desktop');page.set_viewport_size({'width':390,'height':844});bounds('sections-resized-mobile');page.keyboard.press('Escape')
  print(f'PASS contained member, sections, photo; jump/scroll, Escape and focus at {width}px',flush=True)
 browser.close()
