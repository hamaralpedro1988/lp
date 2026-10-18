"""Real Chromium touch gestures for React V5.8; optional QA video and screenshots."""
import argparse, json, time
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
parser=argparse.ArgumentParser();parser.add_argument('--url',default='http://127.0.0.1:5181');parser.add_argument('--screenshots',default='work/v58/screenshots');parser.add_argument('--video',action='store_true');args=parser.parse_args()
out=Path(args.screenshots);out.mkdir(parents=True,exist_ok=True)
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 context=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,**({'record_video_dir':str(out/'video'),'record_video_size':{'width':390,'height':844}} if args.video else {}))
 page=context.new_page();cdp=context.new_cdp_session(page);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 def settle():
  page.evaluate('document.fonts.ready');page.evaluate('() => Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{})))')
 def shot(name):
  settle();page.screenshot(path=str(out/(name+'.png')))
 def seed(index=0,answers=None,notes=None):
  page.goto(args.url+'/?version=5&systemChrome=preview');page.locator('.screen').wait_for()
  page.evaluate('d=>localStorage.setItem("lp-rosa-flow-v5-v01",JSON.stringify(d))',{'screen':'assessment','index':index,'answers':{str(k):v for k,v in (answers or {}).items()},'notes':{str(k):v for k,v in (notes or {}).items()},'feedback':'','offline':False,'paused':False,'assessorConfirmed':False});page.reload();page.locator('.spatial-live-card').wait_for();settle()
 def pos(n): expect(page.locator('.spatial-position')).to_have_text(f'{n} of 11')
 def point():
  box=page.locator('.spatial-question-title').bounding_box();return (box['x']+box['width']*.75,box['y']+min(35,box['height']/2))
 def stroke(dx,dy=0,xy=None,dragshot=None):
  x,y=xy or point();cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y}]})
  for i in range(1,9):
   cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x+dx*i/8,'y':y+dy*i/8}]});time.sleep(.02)
  if dragshot: page.screenshot(path=str(out/(dragshot+'.png')))
  cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});settle()
 seed();expect(page.get_by_role('radio')).to_have_count(2)
 progress=page.locator('[role=progressbar]');expect(progress).to_have_attribute('aria-valuenow','0')
 assert page.locator('.device-shell,.device-camera,.device-volume,.device-power').count()==0
 assert page.locator('.phone').evaluate('e=>getComputedStyle(e).borderRadius')=='0px'
 assert page.locator('.spatial-live-card').evaluate('e=>parseFloat(getComputedStyle(e).borderRadius)')>=25
 assert page.locator('.spatial-progress>span').count()==1
 assert progress.bounding_box()['y']<page.locator('.spatial-header').bounding_box()['y']
 stroke(-155,dragshot='01-unanswered-drag');pos(1);expect(page.locator('.spatial-swipe-feedback')).to_contain_text('Choose Pass or Fail');shot('02-blocked-snapback')
 page.get_by_role('radio',name='Pass',exact=True).check();expect(progress).to_have_attribute('aria-valuenow','1')
 stroke(-155,dragshot='03-valid-drag');pos(2);expect(page.locator('#live-question-title')).to_be_focused()
 assert page.evaluate('JSON.parse(localStorage.getItem("lp-rosa-flow-v5-v01")).index')==1
 box=page.locator('.spatial-question-title').bounding_box();stroke(140,xy=(box['x']+40,box['y']+25));pos(1)
 stroke(140,xy=(box['x']+40,box['y']+25));pos(1);expect(page.locator('.spatial-swipe-feedback')).to_contain_text('first task')
 # A vertical CDP gesture scrolls the WHOLE card and never changes criterion.
 page.set_viewport_size({'width':390,'height':520});settle();card=page.locator('.spatial-live-card');box=card.bounding_box()
 stroke(-5,-130,xy=(box['x']+box['width']/2,box['y']+box['height']-35));pos(1)
 assert card.evaluate('e=>e.scrollTop')>0,'vertical touch scroll must remain native'
 # Composer and controls never initiate criterion navigation.
 page.set_viewport_size({'width':390,'height':844});card.evaluate('e=>e.scrollTop=e.scrollHeight');box=page.get_by_role('textbox',name='Comment',exact=True).bounding_box()
 stroke(-90,xy=(box['x']+box['width']*.7,box['y']+15));pos(1)
 page.keyboard.press('Escape');card.evaluate('e=>e.scrollTop=0')
 # Edge starts, short drags and multi-touch cancel without changing the answer/index.
 stroke(-15);pos(1)
 box=card.bounding_box();stroke(140,xy=(5,box['y']+60));pos(1)
 x,y=point();cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y,'id':1}]});cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x-20,'y':y,'id':1},{'x':x+10,'y':y+10,'id':2}]});cdp.send('Input.dispatchTouchEvent',{'type':'touchCancel','touchPoints':[]});pos(1)
 page.get_by_role('button',name='Sections',exact=True).click();shot('04-sections');page.keyboard.press('Escape');expect(page.get_by_role('button',name='Sections',exact=True)).to_be_focused()
 seed(8,{8:'fail'});stroke(-155);pos(9);expect(page.locator('.spatial-swipe-feedback')).to_contain_text('Comment and photo required')
 page.get_by_role('textbox',name='Comment',exact=True).fill('Quality checked against station standard.');stroke(-155);pos(9);expect(page.locator('.spatial-swipe-feedback')).to_contain_text('Photo required');shot('05-evidence-snapback')
 # Real local photo plus comment permits swipe; deleting either would block again.
 fixture=out/'photo.png';page.screenshot(path=str(fixture));page.get_by_role('button',name='Add photo',exact=True).click();page.locator('input[aria-label="Take photo"]').nth(8).set_input_files(str(fixture));page.keyboard.press('Escape');expect(page.get_by_role('dialog')).to_have_count(0);settle();card.evaluate('e=>e.scrollTop=0');stroke(-155);pos(10)
 # Reduced motion still navigates with no drag transform or lingering animations.
 page.emulate_media(reduced_motion='reduce');page.get_by_role('radio',name='Fail',exact=True).check();stroke(-155);pos(11)
 assert page.locator('.spatial-live-card').evaluate('e=>getComputedStyle(e).transform')=='none'
 assert page.evaluate('document.getAnimations().filter(a=>a.playState==="running").length')==0
 page.get_by_role('radio',name='Pass',exact=True).check();stroke(-155);expect(page.locator('.screen')).to_have_attribute('data-screen','review')
 # No overall success is inferred from reaching Review.
 expect(page.get_by_role('button',name='Continue to feedback & sign-off')).to_be_disabled()
 page.emulate_media(reduced_motion='no-preference')
 # Reference-comparable mobile screenshots, mock preview chrome opt-in; native chrome hidden by default.
 for width in [320,375,390,419]:
  page.set_viewport_size({'width':width,'height':844});seed(1,{0:'met',1:'met'});shot(f'06-live-{width}')
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  assert page.locator('.phonebottom').bounding_box()['y']+page.locator('.phonebottom').bounding_box()['height']<=845
  assert page.locator('.spatial-system-chrome').is_visible()
  box=progress.bounding_box();screen=page.locator('.screen').bounding_box();assert abs(box['x']-screen['x']-17)<1
  assert abs(page.locator('.spatial-progress>span').bounding_box()['width']/box['width']-2/11)<.01
  print(f'PASS edge-to-edge, continuous progress and chrome at {width}px',flush=True)
 page.goto(args.url+'/?version=5');page.locator('.spatial-live-card').wait_for();expect(page.locator('.spatial-system-chrome')).to_be_hidden()
 page.goto(args.url+'/?version=5&native=1');page.locator('.spatial-live-card').wait_for();expect(page.locator('.spatial-system-chrome')).to_be_hidden()
 # CSS safe-area variables can be inspected with synthetic insets, without claiming a physical device test.
 page.add_style_tag(content='.participant-flow .phone{padding-top:24px!important}.participant-flow .phonebottom{padding-bottom:24px!important}')
 shot('07-safe-area-native')
 assert not errors,errors
 context.close();browser.close()
 print('PASS valid/blocked swipe, right-back, strict evidence, scroll, composer/edge/multitouch suppression, focus, reduced motion and native chrome',flush=True)
