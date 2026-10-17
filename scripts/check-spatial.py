"""React V5.6 functional + visual acceptance; runs against dev OR built preview.
python scripts/check-spatial.py --url http://127.0.0.1:5173 --screenshots docs/rosa-v5-6/screenshots
"""
import argparse, json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
parser=argparse.ArgumentParser()
parser.add_argument('--url',default='http://127.0.0.1:5173')
parser.add_argument('--screenshots',default='work/v56/screenshots')
args=parser.parse_args()
shots=Path(args.screenshots);shots.mkdir(parents=True,exist_ok=True)
KEY='lp-rosa-flow-v5-v01'
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 context=b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
 page=context.new_page();errors=[]
 page.on('pageerror',lambda error:errors.append(str(error)))
 def settle():
  page.evaluate('document.fonts.ready')
  page.evaluate('() => Promise.all(document.getAnimations().map(a => a.finished.catch(() => {})))')
 def capture(name,full=False):
  settle();page.mouse.move(1,1);page.screenshot(path=str(shots/(name+'.png')),full_page=full)
 def complete(n):expect(page.get_by_role('progressbar',name='Criteria complete')).to_have_attribute('aria-valuenow',str(n))
 def nav(name):page.get_by_role('button',name=name,exact=True).click()
 page.goto(args.url+'/?version=5')
 expect(page.get_by_role('heading',name='Your assessments',exact=True)).to_be_visible()
 capture('01-assignments-390')
 nav('View Assessment');capture('02-overview-390')
 page.locator('.screen').evaluate('(e)=>e.scrollTop=e.scrollHeight');capture('02-overview-details-390')
 member=page.get_by_role('button',name='View team member Dre Jackson');member.click()
 capture('06-member-sheet');nav('Back to overview');expect(member).to_be_focused()
 nav('Start Assessment');complete(0)
 expect(page.get_by_role('radio')).to_have_count(2)
 expect(page.get_by_role('button',name='Next',exact=True)).to_be_disabled()
 expect(page.get_by_role('radio',name='Pass',exact=True)).not_to_be_checked()
 assert page.locator('.spatial-header').inner_text()=='Fryer Station\nDR\nDre'
 for sel in ['.spatial-header','.phonebottom']:
  assert page.locator(sel).evaluate('(e)=>getComputedStyle(e).backgroundColor')=='rgba(0, 0, 0, 0)',sel
 page.get_by_role('radio',name='Pass',exact=True).focus();page.keyboard.press('ArrowDown')
 expect(page.get_by_role('radio',name='Fail',exact=True)).to_be_checked();complete(1)
 expect(page.locator('.spatial-position')).to_have_text('01 / 11')
 page.keyboard.press('ArrowUp');expect(page.get_by_role('radio',name='Pass',exact=True)).to_be_checked()
 nav('Next');expect(page.locator('#live-question-title')).to_be_focused()
 expect(page.get_by_role('button',name='Next',exact=True)).to_be_disabled()
 capture('03-live-390')
 nav('Previous criterion');expect(page.locator('.spatial-question-body')).to_have_attribute('data-direction','back')
 nav('Sections');expect(page.locator('.spatial-criterion-link')).to_have_count(11)
 capture('06-sections-sheet');page.keyboard.press('Escape');expect(page.get_by_role('button',name='Sections',exact=True)).to_be_focused()
 nav('Sections');page.locator('.spatial-criterion-link').nth(8).click()
 expect(page.locator('#live-question-title')).to_be_focused()
 page.get_by_role('radio',name='Fail',exact=True).check();complete(1)
 expect(page.get_by_role('button',name='Next',exact=True)).to_be_disabled()
 expect(page.locator('.spatial-camera')).to_have_attribute('data-required','true')
 capture('06-required-evidence')
 nav('Add photo');capture('06-camera-sheet')
 fixture=shots/'photo-fixture.png';page.screenshot(path=str(fixture))
 page.locator('input[aria-label="Take photo"]').nth(8).set_input_files(str(fixture));page.keyboard.press('Escape')
 expect(page.locator('.flow-gallery img')).to_have_count(1);complete(2)
 page.locator('.flow-gallery button[aria-label^="Preview"]').click();capture('06-photo-preview')
 page.keyboard.press('Escape');expect(page.locator('.flow-gallery button[aria-label^="Preview"]')).to_be_focused()
 nav('Remove photo-fixture.png');complete(1)
 nav('Add photo');page.locator('input[aria-label="Take photo"]').nth(8).set_input_files(str(fixture));page.keyboard.press('Escape');complete(2)
 page.reload();complete(1);expect(page.get_by_role('button',name='Next',exact=True)).to_be_disabled()
 expect(page.locator('.flow-gallery img')).to_have_count(0)
 page.get_by_role('textbox',name='Comment',exact=True).fill('Observed finished quality against the station standard.')
 complete(2);expect(page.get_by_role('button',name='Next',exact=True)).to_be_enabled()
 page.reload();expect(page.get_by_role('textbox',name='Comment',exact=True)).to_have_value('Observed finished quality against the station standard.')
 nav('Sections');nav('Review all');capture('04-review-incomplete-390')
 expect(page.get_by_role('button',name='Continue to feedback & sign-off')).to_be_disabled()
 assert 'Needs coaching' not in page.locator('.phone').inner_text()
 page.get_by_role('button',name='Edit: Prepares a safe, clean work area',exact=True).click()
 for i in range(11):
  page.get_by_role('radio',name='Fail' if i in [4,8] else 'Pass',exact=True).check()
  expect(page.locator('.spatial-position')).to_have_text(f'{i+1:02d} / 11')
  nav('Review' if i==10 else 'Next')
 expect(page.get_by_role('heading',name='Review observations',exact=True)).to_be_visible()
 expect(page.locator('.review-stat')).to_have_count(3)
 expect(page.get_by_role('button',name='Continue to feedback & sign-off')).to_be_enabled()
 capture('04-review-390')
 page.locator('.screen').evaluate('(e)=>e.scrollTop=e.scrollHeight');capture('04-review-details-390')
 nav('Continue to feedback & sign-off')
 expect(page.locator('.approval-row')).to_have_count(2)
 page.get_by_role('textbox',name='Coaching / feedback note').fill('Discuss safe basket handling and quality checks with Dre.')
 capture('05-signoff-390')
 page.locator('.screen').evaluate('(e)=>e.scrollTop=e.scrollHeight');capture('05-signoff-details-390')
 nav('Confirm assessor review');capture('06-confirmation-sheet')
 expect(page.get_by_role('dialog')).to_contain_text('Not certified yet')
 nav('Done for now');expect(page.locator('.overview-status')).to_contain_text('Review recorded · demo')
 saved=page.evaluate('(k)=>localStorage.getItem(k)',KEY)
 # All screens across requested widths and desktop.
 for width in [320,375,390,419,1440]:
  page.set_viewport_size({'width':width,'height':844})
  for screen in ['list','overview','assessment','review','signoff']:
   page.evaluate('a=>{const d=JSON.parse(a.saved);d.screen=a.screen;d.index=1;localStorage.setItem(a.key,JSON.stringify(d))}',{'saved':saved,'screen':screen,'key':KEY})
   page.reload();page.locator('.screen').wait_for();settle()
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(width,screen,'page overflow')
   assert page.locator('.screen').evaluate('(e)=>e.scrollWidth<=e.clientWidth'),(width,screen,'screen overflow')
   box=page.locator('.phonebottom').bounding_box();assert box['y']+box['height']<=845,(width,screen,'footer below viewport')
   capture(f'{screen}-{width}')
  print(f'PASS all five React screens at {width}px',flush=True)
 # Whole-card scroll: composer naturally follows answers, no nested sticky footer.
 page.set_viewport_size({'width':320,'height':520})
 page.evaluate('k=>{const d=JSON.parse(localStorage.getItem(k));d.screen="assessment";d.index=8;d.offline=true;localStorage.setItem(k,JSON.stringify(d))}',KEY)
 page.reload();expect(page.locator('.spatial-header')).to_contain_text('Offline · local draft only')
 card=page.locator('.spatial-live-card')
 assert card.evaluate('(e)=>e.scrollHeight>e.clientHeight')
 before=page.locator('.spatial-evidence').bounding_box()['y']
 card.evaluate('(e)=>e.scrollTop=e.scrollHeight')
 assert page.locator('.spatial-evidence').bounding_box()['y']<before
 assert card.evaluate('(e)=>getComputedStyle(e).scrollbarWidth')=='none'
 page.get_by_role('textbox',name='Comment',exact=True).focus();capture('07-short-mobile-evidence')
 page.emulate_media(reduced_motion='reduce')
 nav('Previous criterion');assert page.locator('.spatial-question-body').evaluate('(e)=>getComputedStyle(e).animationName')=='none'
 assert page.evaluate('document.getAnimations().filter(a=>a.effect.getComputedTiming().iterations===Infinity).length')==0
 page.add_style_tag(content='.flow-v5 .spatial-question-description {font-size:22px!important}.flow-v5 .spatial-question-title {font-size:36px!important}')
 assert card.evaluate('(e)=>e.scrollWidth<=e.clientWidth')
 page.evaluate('() => { Storage.prototype.setItem=function(){throw new Error("Test storage failure")}; }')
 page.get_by_role('radio',name='Fail',exact=True).check()
 expect(page.get_by_role('alert')).to_contain_text('Local save unavailable')
 capture('07-save-error')
 context.set_offline(True)
 expect(page.locator('.spatial-header')).to_contain_text('Local save unavailable')
 context.set_offline(False)
 # Legacy coaching is unassessed, explicitly disclosed, never mapped to Fail.
 page.reload();page.evaluate('k=>localStorage.setItem(k,JSON.stringify({screen:"assessment",index:0,answers:{0:"coaching"},notes:{}}))',KEY);page.reload()
 expect(page.locator('.notice[role=status]')).to_contain_text('Earlier coaching observations')
 expect(page.get_by_role('radio',name='Fail',exact=True)).not_to_be_checked();complete(0)
 expect(page.get_by_role('button',name='Next',exact=True)).to_be_disabled()
 context.set_offline(True)
 expect(page.locator('.spatial-header')).to_contain_text('Offline · local draft only')
 context.set_offline(False)
 expect(page.locator('.spatial-header')).not_to_contain_text('Offline · local draft only')
 # V2-V4 keep three choices, own colors, their evidence layout and separate state.
 saved_v5=page.evaluate('(k)=>localStorage.getItem(k)',KEY)
 for version in [2,3,4]:
  page.goto(args.url+f'/?version={version}');nav('Start Assessment')
  expect(page.get_by_role('radio')).to_have_count(3)
  expect(page.get_by_role('button',name='Next',exact=True)).to_be_disabled()
  page.get_by_role('radio',name='Needs coaching',exact=True).check();nav('Next')
  expect(page.locator('.criterion-position')).to_contain_text('Criterion 2 / 11')
  assert page.locator('.flow-v5').count()==0
  if version==3:expect(page.locator('.evidence-fab-dock')).to_be_visible()
  if version==4:expect(page.locator('.inline-evidence-actions')).to_be_visible()
  assert page.evaluate('(k)=>localStorage.getItem(k)',KEY)==saved_v5
 # Interactive theme catalog, including portals and keyboard focus return.
 page.set_viewport_size({'width':1100,'height':1000})
 page.goto(args.url+'/?view=design-system&section=components&component=dialog');capture('08-theme-catalog',full=True)
 trigger=page.get_by_role('button',name='Open dialog');trigger.click();capture('08-theme-dialog');page.keyboard.press('Escape');expect(trigger).to_be_focused()
 page.goto(args.url+'/?view=design-system&section=components&component=sheet');nav('Open bottom sheet');capture('08-theme-sheet');page.keyboard.press('Tab')
 assert page.evaluate('document.activeElement.closest("[role=dialog]")!==null')
 page.keyboard.press('Escape')
 assert not errors,errors
 print('PASS binary flow, real media, required evidence, persistence, review/sign-off, focus, reduced motion, large text, offline/error, migration, catalog and V2–V4 regressions.',flush=True)
 b.close()
