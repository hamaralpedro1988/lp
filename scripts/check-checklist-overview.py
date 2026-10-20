"""Actual React checklist orientation, read-only previews and sequence editing checks."""
import json,re,base64
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
OUT=Path('docs/rosa-checklist-overview');OUT.mkdir(parents=True,exist_ok=True)
BASE='http://127.0.0.1:5181/?version=5&brandDemo=1';KEY='lp-rosa-flow-v5-v01'
DESCRIPTION='Review completed tasks, continue your current assessment, or preview upcoming criteria.'
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 reports=[];errors=[]
 for theme in ['spatial','fluid']:
  for width in [320,390,430]:
   c=b.new_context(viewport={'width':width,'height':844},is_mobile=True,has_touch=True,reduced_motion='reduce');p=c.new_page();p.on('pageerror',lambda e:errors.append(str(e)))
   url=BASE+'&visualTheme='+theme
   def seed(index=0,answers=None,notes=None,active=None):
    p.goto(url);p.locator('.screen').wait_for()
    d=dict(screen='assessment',index=index,answers=answers or {},notes=notes or {},feedback='',paused=False,offline=False,assessorConfirmed=False)
    if active is not None:d['activeIndex']=active
    p.evaluate('(d)=>localStorage.setItem("'+KEY+'",JSON.stringify(d))',d);p.reload();expect(p.locator('.spatial-live-card')).to_be_visible()
   def open_all():
    p.get_by_role('button',name='All tasks',exact=True).click()
    s=p.get_by_role('dialog',name='All tasks',exact=True);expect(s).to_be_visible();expect(s.get_by_text(DESCRIPTION,exact=True)).to_be_visible();return s
   def row(s,i):return s.locator(f'[data-task-index="{i}"]')
   seed();s=open_all()
   expect(row(s,0)).to_contain_text('Current task');expect(row(s,1)).to_contain_text('Upcoming · Preview only');expect(s.locator('h3').first).to_contain_text('0 of 3 complete')
   for button in s.locator('button.spatial-criterion-link').all():assert button.bounding_box()['height']>=44
   saved=p.evaluate('localStorage.getItem("'+KEY+'")')
   expect(s.get_by_role('button',name='Review all',exact=True)).to_have_count(0)
   row(s,8).click();preview=s.get_by_role('region',name='Task preview')
   expect(preview.get_by_text('Checks the finished product quality',exact=True)).to_be_visible()
   expect(preview.get_by_text('Photo required',exact=True)).to_be_visible();expect(preview.get_by_text('Comment required',exact=True)).to_be_visible()
   expect(preview.get_by_role('textbox')).to_have_count(0);expect(preview.get_by_role('radio')).to_have_count(0)
   for name in ['Next','Save','Add photo','Next task']:expect(preview.get_by_role('button',name=name,exact=True)).to_have_count(0)
   expect(preview.locator('.spatial-question-title')).to_be_focused()
   assert p.evaluate('localStorage.getItem("'+KEY+'")')==saved
   if width==390:s.screenshot(path=str(OUT/f'{theme}-upcoming-preview.png'))
   preview.get_by_role('button',name='View guidance').click();expect(p.get_by_role('dialog',name='Step guidance')).to_be_visible()
   p.get_by_role('button',name='Back to preview',exact=True).click();expect(preview.get_by_role('button',name='View guidance')).to_be_focused()
   p.keyboard.press('Escape');expect(preview).to_have_count(0);expect(row(s,8)).to_be_focused()
   # Browser Back and X also return from preview to list, retaining context.
   row(s,1).click();expect(s.get_by_text('Critical',exact=True)).to_be_visible();p.go_back();expect(row(s,1)).to_be_focused()
   row(s,8).click();s.get_by_role('button',name='Close',exact=True).click();expect(row(s,8)).to_be_focused()
   assert p.evaluate('localStorage.getItem("'+KEY+'")')==saved
   row(s,0).click();expect(p.locator('.spatial-position')).to_have_text('Task 1 of 11')
   expect(p.get_by_role('button',name='Next',exact=True)).to_be_disabled()
   p.get_by_role('radio',name='Fail',exact=True).check();p.get_by_role('button',name='Next',exact=True).click();expect(p.locator('.spatial-position')).to_have_text('Task 2 of 11')
   s=open_all();expect(row(s,0)).to_contain_text('Complete');expect(row(s,1)).to_contain_text('Current task');expect(s.locator('h3').first).to_contain_text('1 of 3 complete')
   if width==390:s.screenshot(path=str(OUT/f'{theme}-partial-checklist.png'))
   # Reopening a completed Fail stays editable and leaves the active task at 2.
   row(s,0).click();expect(p.locator('.spatial-position')).to_have_text('Task 1 of 11')
   expect(p.get_by_role('button',name='Return to current task',exact=True)).to_be_enabled()
   p.get_by_role('radio',name='Pass',exact=True).check();p.get_by_role('textbox',name='Comment',exact=True).fill('Corrected observation')
   d=p.evaluate('JSON.parse(localStorage.getItem("'+KEY+'"))');assert d['activeIndex']==1 and d['index']==0 and d['answers']['0']=='met'
   p.reload();expect(p.get_by_role('textbox',name='Comment',exact=True)).to_have_value('Corrected observation')
   if width==390:p.screenshot(path=str(OUT/f'{theme}-review-completed.png'))
   p.get_by_role('button',name='Return to current task',exact=True).click();expect(p.locator('.spatial-position')).to_have_text('Task 2 of 11')
   # A legacy partial section retains later observations. Preview never rewrites it.
   seed(2,{'0':'met','1':'fail','4':'met'},{'4':'Keep later data'})
   s=open_all();expect(s.locator('h3').first).to_contain_text('2 of 3 complete')
   saved=p.evaluate('localStorage.getItem("'+KEY+'")');row(s,8).click();s.get_by_role('button',name='Back to checklist',exact=True).click();assert p.evaluate('localStorage.getItem("'+KEY+'")')==saved
   # Completed legacy future item can be reviewed, never promotes active frontier.
   row(s,4).click();expect(p.get_by_role('textbox',name='Comment',exact=True)).to_have_value('Keep later data')
   p.get_by_role('radio',name='Fail',exact=True).check();p.get_by_role('button',name='Return to current task',exact=True).click()
   expect(p.locator('.spatial-position')).to_have_text('Task 3 of 11');assert p.evaluate('JSON.parse(localStorage.getItem("'+KEY+'")).answers[4]')=='fail'
   # Required evidence: an answered Fail is incomplete until both modalities exist.
   seed(8,{'8':'fail'})
   s=open_all();expect(row(s,8)).to_contain_text('Current task');expect(s.locator('h3').last).to_contain_text('0 of 3 complete');row(s,8).click()
   expect(p.get_by_role('button',name='Next',exact=True)).to_be_disabled();p.get_by_role('textbox',name='Comment',exact=True).fill('Required observation')
   expect(p.get_by_role('button',name='Next',exact=True)).to_be_disabled()
   p.wait_for_timeout(200)
   p.locator('input[aria-label="Take photo"]').nth(8).set_input_files({'name':'evidence.png','mimeType':'image/png','buffer':base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=')})
   expect(p.get_by_role('button',name='Next',exact=True)).to_be_enabled()
   # All tasks complete: counters include Fail, editing earlier evidence preserves later data.
   seed(10,{str(i):'fail' if i==1 else 'met' for i in range(11)},{'8':'Evidence','10':'Later task note'})
   expect(p.get_by_role('progressbar')).to_have_attribute('aria-valuenow','11')
   s=open_all()
   for i,n in enumerate([3,5,3]):expect(s.locator('h3').nth(i)).to_contain_text(f'{n} of {n} complete')
   row(s,8).click();p.get_by_role('textbox',name='Comment',exact=True).fill('')
   expect(p.get_by_role('button',name='Return to current task',exact=True)).to_be_disabled()
   s=open_all();expect(row(s,8)).to_contain_text('Evidence needed · Review');row(s,8).click()
   p.get_by_role('textbox',name='Comment',exact=True).fill('Corrected evidence');p.get_by_role('button',name='Return to current task',exact=True).click()
   expect(p.locator('.spatial-position')).to_have_text('Task 11 of 11');assert p.evaluate('JSON.parse(localStorage.getItem("'+KEY+'")).notes[10]')=='Later task note'
   # Keyboard navigation / focus restoration / geometry.
   trigger=p.get_by_role('button',name='All tasks',exact=True);trigger.focus();p.keyboard.press('Enter');s=p.get_by_role('dialog',name='All tasks')
   row(s,1).focus();p.keyboard.press('Enter');expect(p.locator('#live-question-title')).to_be_focused()
   s=open_all();p.keyboard.press('Escape');expect(trigger).to_be_focused()
   assert p.evaluate('document.documentElement.scrollWidth<=innerWidth')
   reports.append({'theme':theme,'width':width,'result':'pass','previewPreservedStorage':True,'sequenceAnchorPreserved':True})
   c.close()
 assert not errors,errors
 (OUT/'results.json').write_text(json.dumps({'configurations':reports,'errors':errors},indent=2))
 print('PASS 6 theme/width configurations: current/completed/upcoming, read-only preview, focus/Back/Escape, stable sequence, evidence and legacy data')
 b.close()
