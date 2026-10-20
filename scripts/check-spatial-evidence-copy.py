from pathlib import Path
from playwright.sync_api import sync_playwright,expect
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for theme in ['spatial','fluid']:
  for width in [320,390,419]:
   c=b.new_context(viewport={'width':width,'height':844},is_mobile=True,has_touch=True,reduced_motion='reduce');p=c.new_page();p.goto('http://127.0.0.1:5181/?version=5&visualTheme='+theme)
   p.evaluate('()=>localStorage.setItem("lp-rosa-flow-v5-v01",JSON.stringify({screen:"assessment",index:8,answers:{8:"fail"},notes:{},feedback:"",paused:false,offline:false,assessorConfirmed:false}))');p.reload()
   expect(p.locator('.spatial-composer-help')).to_have_text('Comment and photo required')
   expect(p.locator('.spatial-validation')).to_have_attribute('data-visual','false')
   assert p.locator('.spatial-validation').bounding_box()['width']<=1
   expect(p.get_by_role('button',name='Next',exact=True)).to_be_disabled()
   p.get_by_role('textbox',name='Comment',exact=True).fill('Observation')
   expect(p.locator('.spatial-composer-help')).to_have_text('Photo required')
   assert p.locator('.spatial-validation').bounding_box()['width']<=1
   p.get_by_role('textbox',name='Comment',exact=True).fill('')
   p.locator('.spatial-evidence').scroll_into_view_if_needed()
   if width==390:p.screenshot(path=f'docs/rosa-progress-status/{theme}-single-evidence-message.png')
   assert p.evaluate('document.documentElement.scrollWidth<=innerWidth')
   c.close()
 b.close();print('PASS duplicate message hidden, composer requirement updates and Next guard retained, 6 theme/width cases')
