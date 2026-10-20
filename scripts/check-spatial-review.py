"""Review filters, read-only sheets and real session photo portals in production React."""
import argparse, re
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
parser=argparse.ArgumentParser();parser.add_argument('--url',default='http://127.0.0.1:5181');parser.add_argument('--screenshots',default='work/review-criteria');args=parser.parse_args()
out=Path(args.screenshots);out.mkdir(parents=True,exist_ok=True)
KEY='lp-rosa-flow-v5-v01'
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);p=b.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True);errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
 def settle():p.evaluate('()=>Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{})))')
 def chip(name):return p.get_by_role('tablist',name='Filter tasks').get_by_role('tab',name=re.compile('^'+name))
 def choose(name):chip(name).click();expect(chip(name)).to_have_attribute('aria-selected','true');expect(p.locator('.spatial-review-filters [role=tab][aria-selected=true]')).to_have_count(1)
 def close():p.get_by_role('dialog',name='Task details',exact=True).get_by_role('button',name='Close',exact=True).last.click();expect(p.get_by_role('dialog')).to_have_count(0);settle()
 p.goto(args.url+'/?version=5&brandDemo=1');p.locator('.screen').wait_for();fixture=Path('work/review-criteria-photo-fixture.png');fixture.parent.mkdir(parents=True,exist_ok=True);p.screenshot(path=str(fixture))
 note='  Original quality observation.\nCheck against the agreed standard.  '
 draft={'screen':'review','index':8,'answers':{str(i):'fail' if i in [1,4,8] else 'met' for i in range(11)},'notes':{'8':note},'feedback':'Existing feedback','offline':False,'paused':False,'assessorConfirmed':False}
 p.evaluate('(a)=>localStorage.setItem(a.key,JSON.stringify(a.draft))',{'key':KEY,'draft':draft});p.reload();p.locator('.spatial-review-list').wait_for()
 choose('Failed');expect(p.locator('.review-item')).to_have_count(2)
 choose('All');row=p.get_by_role('button',name='View: Checks the finished product quality',exact=True);expect(row).to_contain_text('Incomplete');row.click();expect(p.get_by_role('dialog').locator('.spatial-review-outcome')).to_have_text('Incomplete');expect(p.get_by_role('dialog')).to_contain_text('Recorded response: Fail. Photo required.');close()
 p.locator('input[aria-label="Take photo"]').nth(8).set_input_files(str(fixture));saved=p.evaluate('(key)=>localStorage.getItem(key)',KEY)
 choose('Passed');expect(p.locator('.review-item')).to_have_count(8)
 choose('Critical');expect(p.locator('.review-item')).to_have_count(3)
 choose('Failed');expect(p.locator('.review-item')).to_have_count(3)
 # Segmented tabs use native roving focus and automatic keyboard selection.
 choose('All');chip('All').focus();p.keyboard.press('ArrowRight');expect(chip('Failed')).to_have_attribute('aria-selected','true');expect(p.locator('.review-item')).to_have_count(3)
 row=p.get_by_role('button',name='View: Checks the finished product quality',exact=True)
 expect(row.locator('.spatial-review-evidence-tag')).to_have_count(2)
 assert row.locator('.spatial-review-evidence-tag').first.evaluate('e=>getComputedStyle(e.querySelector(".sr-only")).position==="absolute"')
 for width in [320,390,419]:
  p.set_viewport_size({'width':width,'height':844});assert p.get_by_role('tablist',name='Filter tasks').bounding_box()['height']==36;chip('Failed').scroll_into_view_if_needed();p.evaluate('()=>{document.activeElement?.blur();window.scrollTo(0,0)}');settle();p.screenshot(path=str(out/f'criteria-{width}.png'))
  row=p.get_by_role('button',name='View: Checks the finished product quality',exact=True);row.click();dialog=p.get_by_role('dialog',name='Task details',exact=True);expect(dialog).to_be_visible();settle()
  expect(dialog.get_by_role('heading',name='Checks the finished product quality',exact=True)).to_be_visible();expect(dialog.locator('.spatial-review-original-note')).to_have_text(note,use_inner_text=False)
  assert dialog.locator('.spatial-review-original-note').text_content()==note
  expect(dialog.get_by_role('radio')).to_have_count(0);expect(dialog.get_by_role('textbox')).to_have_count(0);expect(dialog.get_by_role('button',name=re.compile('^Remove'))).to_have_count(0)
  expect(dialog.get_by_role('button',name=re.compile('^Preview'))).to_have_count(1)
  box=dialog.bounding_box();phone=p.locator('.phone').bounding_box();assert box['width']<=phone['width']+1 and box['height']<=phone['height']*.89
  p.screenshot(path=str(out/f'details-{width}.png'));dialog.get_by_role('button',name=re.compile('^Preview')).scroll_into_view_if_needed();settle();p.screenshot(path=str(out/f'details-photos-{width}.png'))
  dialog.get_by_role('button',name=re.compile('^Preview')).click();preview=p.get_by_role('dialog',name='Evidence preview',exact=True);expect(preview).to_be_visible();expect(preview.locator('img')).to_have_attribute('src',re.compile('^blob:'))
  p.keyboard.press('Escape');expect(preview).to_have_count(0);expect(dialog).to_be_visible();p.keyboard.press('Escape');expect(dialog).to_have_count(0);expect(row).to_be_focused();expect(chip('Failed')).to_have_attribute('aria-selected','true')
  assert p.evaluate('(key)=>localStorage.getItem(key)',KEY)==saved
  assert p.evaluate('document.documentElement.scrollWidth<=innerWidth')
  print('PASS',width,'filters, sheet, original note, actual photo preview, focus, unchanged draft and filter',flush=True)
 # Browser Back closes only the current observation, preserving the Review.
 row.click();expect(p.get_by_role('dialog')).to_be_visible();p.go_back();expect(p.get_by_role('dialog')).to_have_count(0);expect(chip('Failed')).to_have_attribute('aria-selected','true')
 # Dismissal gesture belongs to the handle, never to scrolling observation content.
 row.click();dialog=p.get_by_role('dialog',name='Task details');expect(dialog).to_be_visible();settle();handle=dialog.get_by_role('button',name='Close task details');box=handle.bounding_box();x=box['x']+box['width']/2;y=box['y']+box['height']/2;cdp=p.context.new_cdp_session(p)
 cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y}]})
 for step in range(1,7):cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x,'y':y+step*12}]})
 cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});expect(dialog).to_have_count(0);expect(chip('Failed')).to_have_attribute('aria-selected','true');print('PASS swipe-down handle dismissal',flush=True)
 # No observation/photo container for a criterion without evidence.
 choose('Passed');first=p.locator('.review-item').first;first.focus();p.keyboard.press('Enter');dialog=p.get_by_role('dialog',name='Task details');expect(dialog).to_contain_text('No observation added.');expect(dialog.get_by_role('region',name='Attached photos')).to_have_count(0)
 # Focus is trapped while tabbing; explicit edit follows existing live workflow.
 p.keyboard.press('Tab');assert dialog.evaluate('e=>e.contains(document.activeElement)')
 dialog.get_by_role('button',name='Edit observation',exact=True).click();expect(p.locator('.screen')).to_have_attribute('data-screen','assessment');expect(p.locator('.spatial-position')).to_have_text('Task 1 of 11')
 # Explorer mounts the real same filter, row and detail components.
 p.goto(args.url+'/?view=design-system&section=rosa&pattern=review');p.get_by_role('tablist',name='Filter tasks').wait_for();choose('Failed');expect(p.locator('.spatial-review-filter-empty')).to_contain_text('No failed tasks');choose('Critical');expect(p.locator('.review-item')).to_have_count(3);p.locator('.review-item').first.click();expect(p.get_by_role('dialog',name='Task details')).to_be_visible();p.keyboard.press('Escape');expect(chip('Critical')).to_have_attribute('aria-selected','true')
 p.get_by_role('combobox',name='Story state').click();p.get_by_role('option',name='Complete',exact=True).click();choose('All');p.get_by_role('button',name='View: Checks the finished product quality',exact=True).click();dialog=p.get_by_role('dialog',name='Task details');expect(dialog.get_by_role('button',name='Preview Preview illustration.svg',exact=True)).to_be_visible();dialog.get_by_role('button',name='Preview Preview illustration.svg',exact=True).click();expect(p.get_by_role('dialog',name='Preview illustration',exact=True)).to_be_visible();p.keyboard.press('Escape');expect(dialog).to_be_visible();p.keyboard.press('Escape')
 assert not errors,errors
 print('PASS keyboard, browser Back, empty observation, no empty photos and existing edit workflow',flush=True)
 b.close()
