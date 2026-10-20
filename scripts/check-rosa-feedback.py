"""Actual React production-build regression. Uses isolated browser storage only."""
import json,re
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
ROOT=Path('docs/rosa-feedback-refinement');ROOT.mkdir(parents=True,exist_ok=True)
BASE='http://127.0.0.1:5181/'
KEY='lp-rosa-flow-v5-v01'

def fixture(completed=True):
 d=dict(screen='review',index=0,answers={str(i):'fail' if i==4 else 'met' for i in range(11)},notes={'8':'Quality checked against station standard.'},feedback='',offline=False,paused=False,assessorConfirmed=False)
 if completed:d['completion']={'at':'2026-10-19T09:41:00Z','photos':{'8':1}}
 return d

def seed(p,d,theme):
 p.goto(BASE+'?version=5&brandDemo=1&visualTheme='+theme)
 p.evaluate('(d)=>localStorage.setItem("'+KEY+'",JSON.stringify(d))',d)
 p.reload();expect(p.locator('.screen')).to_be_visible()

def settle(p):p.evaluate('()=>Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{})))')
def open_task(p,i=0):
 view=p.get_by_role('button',name='View All',exact=True)
 if i>=4 and view.count():view.click()
 trigger=p.locator('.review-item').nth(i);trigger.click()
 sheet=p.get_by_role('dialog',name='Task details',exact=True);expect(sheet).to_be_visible();settle(p)
 return sheet

def comment(sheet):return sheet.get_by_role('textbox',name=re.compile('Rosa’s observation'))

with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 checks=[];errors=[]
 for theme in ['spatial','fluid']:
  context=b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,reduced_motion='reduce',record_video_dir=str(ROOT/'video') if theme=='spatial' else None)
  p=context.new_page();p.on('pageerror',lambda e:errors.append(str(e)))
  p.goto(BASE+f'?version=5&brandDemo=1&flowPreview=overview&visualTheme={theme}')
  widget=p.locator('.spatial-before-start');expect(widget.locator('li')).to_have_count(4)
  titles=widget.locator('.overview-section-copy>span').all_text_contents()
  assert titles==['Estimated time: ~15 min','Progress saves automatically','Shared feedback'],titles
  expect(widget.get_by_role('switch',name='Preview Do Not Disturb')).to_be_visible()
  widget.screenshot(path=str(ROOT/f'{theme}-before-start.png'))
  widget.get_by_role('switch').click();expect(p.get_by_role('status').filter(has_text='Phone settings haven’t changed.')).to_be_visible()
  p.goto(BASE+f'?version=5&brandDemo=1&flowPreview=live&visualTheme={theme}')
  composer=p.locator('.spatial-evidence');field=composer.get_by_role('textbox',name='Comment',exact=True)
  expect(field).to_have_attribute('placeholder','Add a comment...');field.fill('The station was clean.')
  expect(composer.get_by_text('Visible to Dre and other authorised users',exact=True)).to_be_visible()
  assert 'visibility' in field.get_attribute('aria-describedby')
  composer.screenshot(path=str(ROOT/f'{theme}-composer.png'))
  # Full lifecycle: empty -> dirty -> cancel -> save -> reopen -> refresh.
  seed(p,fixture(),theme);sheet=open_task(p);field=comment(sheet)
  expect(field).to_have_value('');assert not field.evaluate('(e)=>document.activeElement===e')
  expect(sheet.get_by_role('button',name='Save changes',exact=True)).to_have_count(0)
  sheet.screenshot(path=str(ROOT/f'{theme}-observation-empty.png'))
  field.fill('Unsaved observation');expect(sheet.get_by_role('button',name='Save changes',exact=True)).to_be_visible()
  sheet.screenshot(path=str(ROOT/f'{theme}-observation-unsaved.png'))
  sheet.get_by_role('button',name='Cancel',exact=True).click();expect(field).to_have_value('')
  field.fill('Work area kept clean.');sheet.get_by_role('button',name='Save changes',exact=True).click()
  expect(field).to_have_value('Work area kept clean.');expect(sheet.get_by_role('button',name='Save changes',exact=True)).to_have_count(0)
  expect(field).to_be_focused();sheet.screenshot(path=str(ROOT/f'{theme}-observation-saved.png'))
  sheet.get_by_role('button',name='Close',exact=True).first.click();sheet=open_task(p)
  expect(comment(sheet)).to_have_value('Work area kept clean.')
  # X/Escape must protect the same unsaved value; modal returns to editing.
  comment(sheet).fill('Discard me');p.keyboard.press('Escape')
  confirm=p.get_by_role('alertdialog',name='Discard comment changes?');expect(confirm).to_be_visible()
  confirm.get_by_role('button',name='Keep editing').click();expect(comment(sheet)).to_have_value('Discard me')
  sheet.get_by_role('button',name='Close',exact=True).first.click();expect(confirm).to_be_visible()
  confirm.get_by_role('button',name='Discard changes').click();expect(p.get_by_role('dialog',name='Task details')).to_have_count(0)
  expect(p.locator('.review-item').first).to_be_focused()
  p.reload();sheet=open_task(p);expect(comment(sheet)).to_have_value('Work area kept clean.')
  sheet.get_by_role('button',name='Close',exact=True).first.click()
  # Required comment can be temporarily invalid without unlocking responses.
  sheet=open_task(p,8);field=comment(sheet);expect(field).not_to_have_value('')
  field.fill('');expect(field).to_have_attribute('aria-invalid','true')
  sheet.get_by_role('button',name='Save changes',exact=True).click()
  expect(sheet.get_by_text('Comment required before submission. You can save this draft and add it later.',exact=True)).to_be_visible()
  expect(sheet.locator('.spatial-review-outcome')).to_have_text('Pass')
  sheet.get_by_role('button',name='Close',exact=True).first.click()
  expect(p.get_by_role('button',name='Sign Off',exact=True)).to_be_disabled()
  p.reload();assert p.evaluate('JSON.parse(localStorage.getItem("'+KEY+'")).completion')
  expect(p.get_by_role('button',name='Sign Off',exact=True)).to_be_disabled()
  sheet=open_task(p,8);comment(sheet).fill('Quality checked again.');sheet.get_by_role('button',name='Save changes').click();sheet.get_by_role('button',name='Close',exact=True).first.click()
  expect(p.get_by_role('button',name='Sign Off',exact=True)).to_be_enabled()
  p.get_by_role('button',name='Sign Off',exact=True).click()
  expect(p.get_by_text('Comments and photos will be shared with Dre and other authorised users after submission.',exact=True)).to_be_visible()
  expect(p.get_by_role('button',name='Submit assessment',exact=True)).to_be_disabled()
  p.get_by_role('button',name='Collect signature',exact=True).click()
  sign=p.get_by_role('dialog',name='Collect signature',exact=True);sign.get_by_role('textbox',name='Or type your full name to sign').fill('Dre Michael');sign.get_by_role('button',name='Confirm signature').click()
  expect(p.get_by_role('button',name='Submit assessment',exact=True)).to_be_enabled()
  p.get_by_role('button',name='Submit assessment',exact=True).click();expect(p.get_by_role('dialog')).to_contain_text('Saved on this device only')
  submitted=p.evaluate('JSON.parse(localStorage.getItem("'+KEY+'"))');assert submitted['assessorConfirmed']
  submitted['screen']='review';seed(p,submitted,theme);sheet=open_task(p)
  expect(comment(sheet)).to_have_count(0);expect(sheet.get_by_text('Work area kept clean.',exact=True)).to_be_visible()
  sheet.get_by_role('button',name='Close',exact=True).first.click()
  # Before completion: saving Review comments must appear in the actual Live field.
  d=fixture(False);seed(p,d,theme);sheet=open_task(p);comment(sheet).fill('Same note in Live');sheet.get_by_role('button',name='Save changes').click();sheet.get_by_role('button',name='Edit observation',exact=True).click()
  expect(p.get_by_role('textbox',name='Comment',exact=True)).to_have_value('Same note in Live')
  # Persistence failure keeps the unsaved draft and sheet open.
  seed(p,fixture(),theme);sheet=open_task(p);comment(sheet).fill('Keep on error')
  p.evaluate('()=>{window.originalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new Error("test quota")}}')
  sheet.get_by_role('button',name='Save changes').click();expect(sheet.get_by_text('Unable to save changes. Keep this sheet open and try again.',exact=True)).to_be_visible()
  expect(sheet.get_by_role('button',name='Save changes',exact=True)).to_be_visible()
  p.evaluate('()=>{Storage.prototype.setItem=window.originalSetItem}');sheet.get_by_role('button',name='Save changes').click()
  expect(sheet.get_by_role('button',name='Save changes',exact=True)).to_have_count(0)
  # Responsive, larger text, keyboard-short viewport, focus and semantic description.
  for width,height,text in [(320,844,False),(390,844,False),(419,844,False),(390,440,False),(1440,1000,False),(390,844,True)]:
   p.set_viewport_size({'width':width,'height':height})
   if text:p.add_style_tag(content='html {font-size:200%!important} :is(p,small,textarea,button) {font-size:max(1em,16px)!important}')
   expect(comment(sheet)).to_be_visible();comment(sheet).fill(f'Responsive edit {width}x{height} large={text}')
   sheet.get_by_role('button',name='Save changes').scroll_into_view_if_needed();expect(sheet.get_by_role('button',name='Save changes')).to_be_in_viewport()
   assert p.evaluate('document.documentElement.scrollWidth<=innerWidth')
   assert sheet.evaluate('(e)=>e.scrollWidth<=e.clientWidth+1')
   assert 'visibility' in comment(sheet).get_attribute('aria-describedby')
   sheet.get_by_role('button',name='Save changes').click()
   checks.append({'theme':theme,'width':width,'height':height,'largeText':text,'result':'pass'})
  context.close()
 assert not errors,errors
 (ROOT/'browser-results.json').write_text(json.dumps({'checks':checks,'errors':errors,'interactionChecks':'Overview, DND, composer, first/existing/empty notes, cancel/save/discard, focus, persistence, required evidence, Live consistency, signature/submission, submitted read-only, storage failure'},indent=2))
 print('PASS Spatial + Fluid: comment lifecycle, evidence/submission guards, persistence, read-only, save failure, focus, 12 responsive configurations')
 b.close()
