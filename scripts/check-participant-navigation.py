"""Participant chrome and back navigation, against a built preview."""
import argparse
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
parser=argparse.ArgumentParser()
parser.add_argument('--url', default='http://127.0.0.1:5181')
parser.add_argument('--screenshots', default='work/navigation/screenshots')
args=parser.parse_args(); out=Path(args.screenshots); out.mkdir(parents=True,exist_ok=True)
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=browser.new_page()
 for width in [320,390,1440]:
  page.set_viewport_size({'width':width,'height':844})
  page.goto(args.url+'/?version=5');page.locator('.screen').wait_for()
  for screen,back,label,destination in [('list',None,'Assessments',None),('overview','Back to assessments','Assessment overview','list'),('assessment','Back to overview','Fryer Station','overview'),('review','Back to checklist','Assessment review','assessment'),('signoff','Back to review','Feedback & sign-off','review')]:
   draft={'screen':screen,'index':1,'answers':{str(i):'met' for i in range(11)},'notes':{'8':'Quality checks observed.'},'feedback':'Review station safety.','offline':False,'paused':False,'assessorConfirmed':False}
   page.evaluate('d=>localStorage.setItem("lp-rosa-flow-v5-v01",JSON.stringify(d))',draft);page.reload()
   expect(page.locator('.screen')).to_have_attribute('data-screen',screen)
   expect(page.locator('.spatial-header')).to_have_count(1)
   expect(page.locator('.spatial-header .assessment-name')).to_have_text(label)
   expect(page.locator('.side,.right,.stage-label,.floating,.mobile-version-switcher')).to_have_count(0)
   expect(page.get_by_role('button',name='Reset prototype')).to_have_count(0)
   expect(page.locator('a[href="?studio=1"],a[href="?view=design-system"]')).to_have_count(0)
   if screen == 'overview':
    expect(page.get_by_role('heading',name='Before you begin',exact=True)).to_have_count(0)
    assert 'Category 2' not in page.locator('.phone').inner_text()
   if screen == 'assessment':
    aligned=page.evaluate('''() => {
      const progress=document.querySelector('.spatial-segments').getBoundingClientRect();
      const screen=document.querySelector('.screen');const box=screen.getBoundingClientRect();const css=getComputedStyle(screen);
      return Math.abs(progress.left-box.left-parseFloat(css.paddingLeft))<1 && Math.abs(box.right-progress.right-parseFloat(css.paddingRight))<1;
    }''')
    assert aligned, f'Progress must align with content gutters at {width}px'
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
   page.evaluate('document.fonts.ready');page.evaluate('() => Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{})))')
   page.screenshot(path=str(out/f'participant-{screen}-{width}.png'))
   if back:
    expect(page.locator('.spatial-header').get_by_role('button',name=back,exact=True)).to_be_visible()
    page.locator('.spatial-header').get_by_role('button',name=back,exact=True).click()
    expect(page.locator('.screen')).to_have_attribute('data-screen',destination)
   else: expect(page.locator('.spatial-header-back')).to_have_count(0)
  print(f'PASS: five screens and back destinations at {width}px',flush=True)
 browser.close()
