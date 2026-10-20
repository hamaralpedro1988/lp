import re
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
titles=re.findall(r"title: '([^']+)'",Path('src/data/flow-draft.ts').read_text())
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 p=b.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
 errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
 p.goto('http://127.0.0.1:5181/?version=5&brandDemo=1')
 draft={'screen':'overview','index':5,'answers':{'0':'met','1':'fail'},'notes':{'3':'Existing original observation'},'feedback':'Original feedback','offline':False,'paused':True,'assessorConfirmed':False}
 p.evaluate('(d)=>localStorage.setItem("lp-rosa-flow-v5-v01",JSON.stringify(d))',draft);p.reload()
 trigger=p.get_by_role('button',name='Preview assessment',exact=True)
 expect(trigger).to_be_visible();p.wait_for_timeout(100)
 saved=p.evaluate('localStorage.getItem("lp-rosa-flow-v5-v01")')
 trigger.click()
 dialog=p.get_by_role('dialog',name='Assessment preview',exact=True)
 for i,title in enumerate(titles):
  expect(dialog.get_by_role('heading',name=re.compile(re.escape(title)))).to_be_visible()
  expect(dialog.get_by_text(f'Task {i+1} of 11',exact=True)).to_be_visible()
  expect(dialog.locator('[data-tone=critical]')).to_have_count(1 if i in [1,4,7] else 0)
  expect(dialog.get_by_text('Photo required' if i==8 else 'Photo optional',exact=True)).to_be_visible()
  expect(dialog.get_by_text('Comment required' if i==8 else 'Comment optional',exact=True)).to_be_visible()
  expect(dialog.get_by_role('radio')).to_have_count(0)
  expect(dialog.get_by_role('textbox')).to_have_count(0)
  assert p.evaluate('localStorage.getItem("lp-rosa-flow-v5-v01")')==saved
  if i==0:expect(dialog.get_by_role('button',name='Previous',exact=True)).to_be_disabled()
  if i==8:
   dialog.get_by_role('button',name='View guidance',exact=True).click()
   guidance=p.get_by_role('dialog',name='Step guidance',exact=True)
   expect(guidance.get_by_role('heading',name='Check the finished product quality',exact=True)).to_be_visible()
   guidance.get_by_role('button',name='Back to preview',exact=True).click()
   expect(dialog.get_by_text('Task 9 of 11',exact=True)).to_be_visible()
  if i<10:dialog.get_by_role('button',name='Next task',exact=True).click()
 dialog.get_by_role('button',name='Previous',exact=True).click()
 expect(dialog.get_by_text('Task 10 of 11',exact=True)).to_be_visible()
 dialog.get_by_role('button',name='Next task',exact=True).click()
 dialog.get_by_role('button',name='Back to overview',exact=True).click()
 expect(dialog).to_have_count(0);expect(trigger).to_be_focused()
 assert p.evaluate('localStorage.getItem("lp-rosa-flow-v5-v01")')==saved
 for width,height in [(320,844),(390,844),(419,844),(390,520)]:
  p.set_viewport_size({'width':width,'height':height});trigger.click()
  expect(dialog.get_by_text('Task 1 of 11',exact=True)).to_be_visible()
  p.evaluate('()=>Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{})))')
  phone=p.locator('.phone').bounding_box();box=dialog.bounding_box()
  assert box['width']<=phone['width']+1 and box['height']<=phone['height']+1,(box,phone)
  assert p.evaluate('document.documentElement.scrollWidth<=innerWidth')
  p.screenshot(path=f'work/assessment-preview/preview-{width}-{height}.png')
  p.keyboard.press('Escape');expect(dialog).to_have_count(0)
 # Mobile/browser Back dismisses preview instead of leaving the overview.
 trigger.click();expect(dialog).to_be_visible();p.go_back();expect(dialog).to_have_count(0)
 assert p.evaluate('localStorage.getItem("lp-rosa-flow-v5-v01")')==saved
 # Starting still resumes the actual task, not the position explored in preview.
 p.get_by_role('button',name='Resume Assessment',exact=True).click()
 expect(p.locator('.spatial-live-card').get_by_text('Task 3 of 11',exact=True)).to_be_visible()
 # Only two real observations existed, so existing start logic resumes the first missing task.
 assert p.evaluate('JSON.parse(localStorage.getItem("lp-rosa-flow-v5-v01")).answers')==draft['answers']
 assert not errors,errors
 print('PASS all 11 tasks, real critical/evidence rules, nested guidance, no response controls or draft mutation, previous/next, focus, Escape/Back, 320/390/419 and short viewport, actual resume')
 b.close()
