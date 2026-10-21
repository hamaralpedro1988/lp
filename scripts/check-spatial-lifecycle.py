"""React lifecycle + device-local photographic evidence regression."""
import json,re
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
OUT=Path('docs/rosa-progress-status');OUT.mkdir(parents=True,exist_ok=True)
BASE='http://127.0.0.1:5181/?version=5&brandDemo=1';KEY='lp-rosa-flow-v5-v01'
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 results=[]
 for theme in ['spatial','fluid']:
  c=b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,reduced_motion='reduce');p=c.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
  url=BASE+'&visualTheme='+theme
  p.goto(url);p.get_by_role('button',name='Open assessment for Dre Michael').click()
  expect(p.locator('.overview-status')).to_have_text('Ready to start')
  p.get_by_role('button',name='Start assessment',exact=True).click()
  p.get_by_role('button',name='Back to overview',exact=True).click()
  expect(p.locator('.overview-status')).to_have_text('In Progress');expect(p.get_by_role('button',name='Resume assessment',exact=True)).to_be_visible()
  # Real photo and comments on task 9; last visited task is 5, NOT first missing task 2.
  draft=dict(screen='assessment',index=8,started=True,answers={'0':'fail','3':'met','8':'met'},notes={'8':'Quality observed','3':'Original comment'},feedback='',paused=False,offline=False,assessorConfirmed=False)
  p.evaluate('(d)=>localStorage.setItem("'+KEY+'",JSON.stringify(d))',draft);p.reload()
  expect(p.locator('.spatial-position')).to_have_text('Task 9 of 11')
  # Queue restoration finishes before adding a file; actual current task file input.
  p.wait_for_function('()=>document.querySelector(".spatial-evidence")!==null');p.wait_for_timeout(300)
  p.locator('input[aria-label="Take photo"]').nth(8).set_input_files({'name':'fryer-evidence.png','mimeType':'image/png','buffer':__import__('base64').b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=')})
  expect(p.get_by_role('button',name='Preview fryer-evidence.png')).to_be_visible()
  expect(p.get_by_role('progressbar')).to_have_attribute('aria-valuenow','3')
  p.get_by_role('button',name=re.compile('All tasks|Sections')).click();p.get_by_role('button',name=re.compile('Lowers the basket safely')).click()
  expect(p.locator('.spatial-position')).to_have_text('Task 5 of 11')
  p.get_by_role('button',name='Back to overview',exact=True).click()
  expect(p.locator('.overview-status')).to_have_text('In Progress')
  expect(p.get_by_role('progressbar')).to_have_attribute('aria-valuenow','3')
  p.screenshot(path=str(OUT/f'{theme}-overview-in-progress.png'))
  p.get_by_role('button',name='Back to assessments',exact=True).click()
  expect(p.locator('.overview-status')).to_have_text('In Progress')
  expect(p.get_by_role('button',name='Resume assessment',exact=True)).to_be_visible()
  p.screenshot(path=str(OUT/f'{theme}-assignments-in-progress.png'))
  p.get_by_role('button',name='Resume assessment',exact=True).click();expect(p.locator('.spatial-position')).to_have_text('Task 5 of 11')
  p.reload();expect(p.locator('.spatial-position')).to_have_text('Task 5 of 11')
  expect(p.get_by_role('progressbar')).to_have_attribute('aria-valuenow','3')
  p.close();p=c.new_page();p.on('pageerror',lambda e:errors.append(str(e)));p.goto(url)
  expect(p.locator('.spatial-position')).to_have_text('Task 5 of 11');expect(p.get_by_role('progressbar')).to_have_attribute('aria-valuenow','3')
  p.get_by_role('button',name=re.compile('All tasks|Sections')).click();p.get_by_role('button',name=re.compile('Checks the finished product quality')).click()
  expect(p.get_by_role('textbox',name='Comment',exact=True)).to_have_value('Quality observed')
  image=p.get_by_role('button',name='Preview fryer-evidence.png');expect(image).to_be_visible();assert image.locator('img').evaluate('(e)=>e.complete && e.naturalWidth>0')
  p.screenshot(path=str(OUT/f'{theme}-restored-photo.png'))
  # Removal persists too; offline additions use IndexedDB without claiming an upload.
  p.get_by_role('button',name='Remove fryer-evidence.png',exact=True).click()
  expect(p.get_by_role('progressbar')).to_have_attribute('aria-valuenow','2')
  p.reload();expect(p.get_by_role('progressbar')).to_have_attribute('aria-valuenow','2');expect(p.get_by_role('button',name='Preview fryer-evidence.png')).to_have_count(0)
  p.wait_for_timeout(250);c.set_offline(True)
  expect(p.get_by_text('You’re offline. Keep assessing — your progress is saved on this device.',exact=True)).to_be_visible()
  photo={'name':'fryer-evidence.png','mimeType':'image/png','buffer':__import__('base64').b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=')}
  p.locator('input[aria-label="Take photo"]').nth(8).set_input_files(photo)
  expect(p.get_by_role('progressbar')).to_have_attribute('aria-valuenow','3')
  p.evaluate('()=>{window.realIDBOpen=indexedDB.open;indexedDB.open=()=>{throw new Error("test storage failure")}}')
  p.locator('input[aria-label="Take photo"]').nth(8).set_input_files({**photo,'name':'failed-save.png'})
  expect(p.get_by_role('alert').filter(has_text='Unable to save photos on this device.')).to_be_visible()
  expect(p.get_by_role('button',name='Preview failed-save.png')).to_have_count(0)
  p.evaluate('()=>{indexedDB.open=window.realIDBOpen}');c.set_offline(False)
  # All eleven responses WITHOUT required note/photo are never complete.
  all_answers={str(i):'met' for i in range(11)}
  state={**draft,'screen':'overview','answers':all_answers,'notes':{},'index':6}
  p.evaluate('(d)=>localStorage.setItem("'+KEY+'",JSON.stringify(d))',state);p.reload()
  expect(p.get_by_role('progressbar')).to_have_attribute('aria-valuenow','10')
  expect(p.locator('.overview-status')).to_have_text('In Progress');expect(p.get_by_role('button',name='Resume assessment',exact=True)).to_be_visible()
  state['notes']={'8':'Required comment'}
  p.evaluate('(d)=>localStorage.setItem("'+KEY+'",JSON.stringify(d))',state);p.reload()
  expect(p.get_by_role('progressbar')).to_have_attribute('aria-valuenow','11')
  expect(p.locator('.overview-status')).to_have_text('In Progress');p.get_by_role('button',name='Continue to review',exact=True).click()
  expect(p.locator('.screen')).to_have_attribute('data-screen','review');assert not p.evaluate('JSON.parse(localStorage.getItem("'+KEY+'")).completion')
  # A confirmed checklist + collected signature still In Progress until submission.
  state.update(completion={'at':'2026-10-20T10:00:00Z','photos':{'8':1},'notes':state['notes']},signature={'name':'Dre','at':'2026-10-20T10:01:00Z','strokes':[]})
  p.evaluate('(d)=>localStorage.setItem("'+KEY+'",JSON.stringify(d))',state);p.reload()
  expect(p.locator('.overview-status')).to_have_text('In Progress')
  p.get_by_role('button',name='Continue to review',exact=True).click();p.get_by_role('button',name='Sign Off',exact=True).click();p.get_by_role('button',name='Submit assessment',exact=True).click()
  expect(p.get_by_role('dialog',name='Pending Review')).to_be_visible();expect(p.get_by_role('dialog')).to_contain_text('Nothing has been sent to Alex')
  p.get_by_role('dialog').get_by_role('button',name='Close',exact=True).last.click()
  p.get_by_role('button',name='Back to review',exact=True).click();p.get_by_role('button',name='Back to overview',exact=True).click()
  expect(p.locator('.overview-status')).to_have_text('Pending Review');p.screenshot(path=str(OUT/f'{theme}-pending-review.png'))
  # Reset removes persisted blobs as well as response drafts.
  p.get_by_role('button',name='Reset prototype',exact=True).click();expect(p.get_by_role('button',name='Open assessment for Dre Michael')).to_be_visible()
  stored=p.evaluate('''()=>new Promise((resolve,reject)=>{const r=indexedDB.open('rosa-assessment-evidence-v1',1);r.onsuccess=()=>{const db=r.result;const q=db.transaction('evidence').objectStore('evidence').getAllKeys();q.onsuccess=()=>{db.close();resolve(q.result)}};r.onerror=()=>reject(r.error)})''')
  assert not stored,stored
  assert not errors,errors
  results.append({'theme':theme,'resumeLastIndex':4,'validProgress':3,'photoAfterReloadAndPageClose':True,'allAnsweredStillInProgress':True,'pendingReviewAfterSubmission':True,'resetClearsPhotos':True,'errors':errors})
  c.close()
 (OUT/'results.json').write_text(json.dumps(results,indent=2));print('PASS both themes: lifecycle, last visited task, evidence/progress, reload/close photo restoration, Pending Review and reset')
 b.close()
