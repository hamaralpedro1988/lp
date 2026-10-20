"""Optional guidance: real touch, keyboard, back, state isolation and sheet bounds."""
import argparse
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
parser=argparse.ArgumentParser();parser.add_argument('--url',default='http://127.0.0.1:5181');parser.add_argument('--screenshots',default='work/guidance/screenshots');args=parser.parse_args();out=Path(args.screenshots);out.mkdir(parents=True,exist_ok=True)
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);context=b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True);page=context.new_page();cdp=context.new_cdp_session(page);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 def settle():page.evaluate('document.fonts.ready');page.evaluate('() => Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{})))')
 def capture(name):settle();page.screenshot(path=str(out/f'{name}.png'))
 def seed(index):
  page.goto(args.url+'/?version=5&systemChrome=preview');page.locator('.screen').wait_for();page.evaluate('i=>localStorage.setItem("lp-rosa-flow-v5-v01",JSON.stringify({screen:"assessment",index:i,answers:{},notes:{},feedback:""}))',index);page.reload();page.locator('.spatial-guidance-trigger').wait_for();settle()
 def swipe_handle(dx=0,dy=-65):
  target=page.get_by_role('button',name='Open step guidance');target.scroll_into_view_if_needed();box=target.bounding_box();x=box['x']+box['width']/2;y=box['y']+box['height']/2
  cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y}]})
  for i in range(1,7):cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x+dx*i/6,'y':y+dy*i/6}]})
  cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});settle()
 for width,height in [(320,844),(390,844),(419,844),(390,520),(1440,900)]:
  page.set_viewport_size({'width':width,'height':height});seed(0)
  trigger=page.get_by_role('button',name='Open step guidance');trigger.scroll_into_view_if_needed();assert trigger.bounding_box()['height']>=44
  assert trigger.inner_text()=='';expect(page.locator('.spatial-guidance-trigger>span')).to_have_count(1)
  saved=page.evaluate('localStorage.getItem("lp-rosa-flow-v5-v01")');progress=page.get_by_role('progressbar').get_attribute('aria-valuenow');capture(f'closed-{width}-{height}')
  swipe_handle();expect(page.get_by_role('dialog',name='Step guidance')).to_be_visible();expect(page.get_by_role('heading',name='Step guidance',exact=True)).to_be_focused();capture(f'open-{width}-{height}')
  sheet=page.get_by_role('dialog',name='Step guidance').bounding_box();phone=page.locator('.phone').bounding_box();assert sheet['x']>=phone['x']-1 and sheet['x']+sheet['width']<=phone['x']+phone['width']+1;assert sheet['y']+sheet['height']<=phone['y']+phone['height']+1
  assert saved==page.evaluate('localStorage.getItem("lp-rosa-flow-v5-v01")');assert progress==page.get_by_role('progressbar',include_hidden=True).get_attribute('aria-valuenow')
  page.get_by_role('button',name='Back to assessment',exact=True).click();expect(page.get_by_role('dialog')).to_have_count(0);expect(trigger).to_be_focused();expect(page.get_by_role('button',name='Next',exact=True)).to_be_disabled()
  trigger.focus();page.keyboard.press('Enter');expect(page.get_by_role('dialog')).to_be_visible();page.keyboard.press('Escape');expect(page.get_by_role('dialog')).to_have_count(0);expect(trigger).to_be_focused()
  trigger.click();expect(page.get_by_role('dialog')).to_be_visible();page.go_back();expect(page.get_by_role('dialog')).to_have_count(0);expect(page.locator('.screen')).to_have_attribute('data-screen','assessment')
  swipe_handle(dx=-100,dy=0);expect(page.get_by_role('dialog')).to_have_count(0);expect(page.locator('.spatial-position')).to_have_text('Task 1 of 11')
  print(f'PASS tap/up-swipe/keyboard/back, isolated state and sheet bounds at {width}x{height}',flush=True)
 # All criteria expose their own context and guidance; evidence requirements stay mandatory.
 page.set_viewport_size({'width':390,'height':844});seed(8);page.get_by_role('radio',name='Fail',exact=True).check();page.get_by_role('textbox',name='Comment',exact=True).fill('Quality observation saved.')
 page.get_by_role('button',name='Open step guidance').click();expect(page.get_by_role('dialog')).to_contain_text('Check the finished product quality');page.keyboard.press('Escape');expect(page.get_by_role('dialog')).to_have_count(0)
 expect(page.locator('.spatial-composer-help')).to_have_text('Photo required');expect(page.get_by_role('button',name='Next',exact=True)).to_be_disabled();expect(page.get_by_role('textbox',name='Comment',exact=True)).to_have_value('Quality observation saved.')
 for i in range(11):
  page.get_by_role('button',name='Sections',exact=True).click();page.locator('.spatial-criterion-link').nth(i).click();expect(page.get_by_role('dialog')).to_have_count(0);page.get_by_role('button',name='Open step guidance').click();expect(page.locator('.spatial-guidance-sheet [data-slot=sheet-description]')).to_contain_text(f'{i+1} of 11');expect(page.locator('.spatial-guidance-body li')).to_have_count(3);page.keyboard.press('Escape');expect(page.get_by_role('dialog')).to_have_count(0)
 page.emulate_media(reduced_motion='reduce');swipe_handle();expect(page.get_by_role('dialog')).to_be_visible();assert page.evaluate('document.getAnimations().filter(a=>a.playState==="running").length')==0;page.keyboard.press('Escape')
 # Explorer uses the actual export, not a duplicate implementation.
 page.goto(args.url+'/?view=design-system&section=rosa&pattern=guidance');page.get_by_role('button',name='Open step guidance').click();expect(page.get_by_role('dialog',name='Step guidance')).to_be_visible();capture('explorer-guidance')
 assert not errors,errors
 context.close();b.close();print('PASS all eleven tasks, strict evidence preserved, reduced motion and shared Explorer guidance')
