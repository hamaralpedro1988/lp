"""Production-build acceptance for issue #3. No external services are called by stories."""
import argparse,json
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
parser=argparse.ArgumentParser();parser.add_argument('--url',default='http://127.0.0.1:5181');parser.add_argument('--screenshots',default='work/design-system/screenshots');args=parser.parse_args()
shots=Path(args.screenshots);shots.mkdir(parents=True,exist_ok=True)
KEY='lp-rosa-flow-v5-v01'
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 context=browser.new_context(viewport={'width':1440,'height':1000})
 page=context.new_page();errors=[]
 page.on('pageerror',lambda error:errors.append(str(error)))
 def url(section='foundations',**params):return args.url+'/?view=design-system&section='+section+''.join('&'+k+'='+v for k,v in params.items())
 def settle():
  page.evaluate('document.fonts.ready');page.evaluate('() => Promise.all(document.getAnimations().filter(a=>a.effect.getComputedTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{})))')
 def capture(name,full=False):
  settle();page.mouse.move(1,1);page.screenshot(path=str(shots/(name+'.png')),full_page=full)
 def goto(section='foundations',**params):
  page.goto(url(section,**params));expect(page.locator('.ds-explorer')).to_be_visible();settle()
 def storage():return page.evaluate('JSON.stringify(Object.fromEntries(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)])))')
 page.goto(args.url+'/?view=design-system')
 theme=json.loads(Path('src/data/creator-theme.json').read_text())
 page.evaluate('a=>{localStorage.clear();localStorage.setItem(a.key,JSON.stringify({screen:"assessment",index:1,answers:{0:"met"},notes:{},feedback:"Keep this observation",paused:false,offline:false,assessorConfirmed:false}));localStorage.setItem("lp-theme-studio-v2",JSON.stringify(a.theme));}',{'key':KEY,'theme':theme})
 before=storage();page.reload();expect(page.get_by_role('heading',name='Foundations',exact=True)).to_be_visible()
 capture('01-foundations-desktop')
 value=page.locator('[data-token="--spatial-primary"]')
 expect(value).to_have_text('#28253c')
 iris=page.evaluate('getComputedStyle(document.documentElement).getPropertyValue("--spatial-iris").trim()')
 # Export reads the actual shared declarations, not a second palette.
 with page.expect_download() as info:page.get_by_role('button',name='Export tokens',exact=True).click()
 download=info.value;download.save_as('work/design-system/exported-tokens.css')
 assert '--spatial-brand-canvas:#f3f0fb' in Path('work/design-system/exported-tokens.css').read_text()
 page.evaluate('Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText:async()=>{throw new Error("unavailable")}}})')
 page.get_by_role('button',name='Copy --spatial-primary',exact=True).click()
 expect(page.get_by_role('textbox',name='Copy text manually')).to_have_value('var(--spatial-primary)')
 for category in ['Typography','Spacing','Shape & elevation','Motion','Brand aliases']:
  page.get_by_role('combobox',name='Token category').click();page.get_by_role('option',name=category,exact=True).click()
  expect(page.locator('.ds-token')).not_to_have_count(0)
  if category in ['Typography','Shape & elevation','Motion']:capture('01-foundations-'+category.lower().replace(' ','-').replace('&','and'))
 page.get_by_role('button',name='Preview Next').click();expect(page.locator('.ds-motion-window .spatial-question-body')).to_have_attribute('data-direction','next')
 page.get_by_role('button',name='Preview Back').click();expect(page.locator('.ds-motion-window .spatial-question-body')).to_have_attribute('data-direction','back')
 goto('components')
 inventory=sorted(path.stem for path in Path('src/components/ui').glob('*.tsx'))
 expect(page.locator('.ds-component-index button')).to_have_count(len(inventory))
 page.get_by_role('textbox',name='Search design system').fill('Checkbox')
 expect(page.locator('.ds-component-index button')).to_have_count(1)
 expect(page.locator('.ds-detail-title h3')).to_have_text('Checkbox')
 page.get_by_role('textbox',name='Search design system').fill('zz-no-match')
 expect(page.locator('.ds-component-index')).to_contain_text('No matching components');expect(page.locator('.ds-component-detail')).to_have_count(0)
 # Exercise every installed primitive, including portal and control variants.
 for item in inventory:
  goto('components',component=item)
  expect(page.locator('.ds-live-preview')).to_be_visible()
  if item=='button':
   page.locator('.ds-live-preview').get_by_role('button',name='outline',exact=True).click()
   expect(page.locator('.ds-live-preview [role=status]')).to_contain_text('outline action selected')
   expect(page.locator('.ds-live-preview').get_by_role('button',name='Disabled',exact=True)).to_be_disabled()
   capture('02-core-ui-desktop')
  if item=='input':
   page.get_by_role('button',name='Validate email').click();expect(page.get_by_role('textbox',name='Example email')).to_have_attribute('aria-invalid','true')
   page.get_by_role('textbox',name='Example email').fill('rosa@example.com');page.get_by_role('button',name='Validate email').click();expect(page.get_by_role('textbox',name='Example email')).to_have_attribute('aria-invalid','false')
   capture('02-core-input')
  if item=='textarea':
   page.get_by_role('button',name='Validate feedback').click();expect(page.get_by_role('textbox',name='Example feedback')).to_have_attribute('aria-invalid','true')
  if item=='checkbox':page.get_by_role('checkbox',name='Include supporting evidence').check()
  if item=='radio-group':
   page.get_by_role('radio',name='Comfortable',exact=True).focus();page.keyboard.press('ArrowDown');expect(page.get_by_role('radio',name='Compact',exact=True)).to_be_checked()
  if item=='select':
   page.get_by_role('combobox',name='Example section').click();page.get_by_role('option',name='Frying',exact=True).click();expect(page.locator('.ds-live-preview')).to_contain_text('Frying')
  if item=='progress':page.get_by_role('button',name='Increase',exact=True).click();expect(page.get_by_role('progressbar',name='Example progress')).to_have_attribute('aria-valuenow','60')
  if item=='tabs':page.get_by_role('tab',name='Usage',exact=True).click();expect(page.get_by_role('tabpanel')).to_contain_text('Arrows move')
  if item=='dialog':
   trigger=page.get_by_role('button',name='Open dialog',exact=True);trigger.click();expect(page.get_by_role('dialog')).to_be_visible();capture('02-core-dialog');page.keyboard.press('Escape');expect(trigger).to_be_focused()
  if item=='alert-dialog':
   page.get_by_role('button',name='Open confirmation').click();expect(page.get_by_role('alertdialog')).to_be_visible();page.get_by_role('button',name='Cancel',exact=True).click()
  if item=='sheet':
   for side in ['top','right','bottom','left']:
    trigger=page.get_by_role('button',name='Open '+side+' sheet');trigger.click();expect(page.get_by_role('dialog')).to_be_visible();page.keyboard.press('Escape');expect(trigger).to_be_focused()
  if item=='tooltip':page.get_by_role('button',name='About evidence').focus();expect(page.get_by_role('tooltip')).to_be_visible()
  if item=='skeleton':page.get_by_role('button',name='Show resolved content').click();expect(page.locator('.ds-live-preview')).to_contain_text('Example content is ready')
 print('PASS inventory, token export/copy, all installed primitives and real portal interactions',flush=True)
 goto('rosa',pattern='card');expect(page.get_by_role('heading',name='Rosa Flow Components',exact=True)).to_be_visible()
 expect(page.get_by_role('radio')).to_have_count(2);expect(page.get_by_role('button',name='Next',exact=True)).to_be_disabled()
 page.get_by_role('radio',name='Pass',exact=True).check();expect(page.get_by_role('button',name='Next',exact=True)).to_be_enabled()
 page.get_by_role('textbox',name='Comment',exact=True).fill('Preview observation only')
 capture('03-rosa-components-desktop',full=True)
 page.get_by_role('button',name='Add photo',exact=True).click();expect(page.get_by_role('dialog')).to_contain_text('No camera, device library or upload')
 page.get_by_role('button',name='Add sample attachment').click();expect(page.locator('.spatial-attachments img')).to_have_count(1)
 page.get_by_role('button',name='Preview Preview illustration.svg',exact=True).click();expect(page.get_by_role('dialog')).to_be_visible();page.keyboard.press('Escape')
 page.get_by_role('button',name='Remove Preview illustration.svg',exact=True).click();expect(page.locator('.spatial-attachments img')).to_have_count(0)
 page.get_by_role('button',name='Sections',exact=True).click();expect(page.locator('.spatial-criterion-link')).to_have_count(11)
 capture('03-rosa-sections');page.locator('.spatial-criterion-link').nth(8).click()
 expect(page.get_by_role('button',name='Next',exact=True)).to_be_disabled();page.get_by_role('radio',name='Fail',exact=True).check();expect(page.get_by_role('button',name='Next',exact=True)).to_be_disabled()
 page.get_by_role('textbox',name='Comment',exact=True).fill('Required observation');expect(page.get_by_role('button',name='Next',exact=True)).to_be_enabled()
 goto('rosa',pattern='choices');page.get_by_role('combobox',name='Story state').click();page.get_by_role('option',name='Disabled',exact=True).click();expect(page.get_by_role('radio',name='Pass',exact=True)).to_be_disabled()
 goto('rosa',pattern='review');expect(page.locator('.review-stat')).to_have_count(3);page.get_by_role('button',name='Edit: Prepares a safe, clean work area',exact=True).click();expect(page.locator('.spatial-live-card')).to_be_visible();page.get_by_role('button',name='Back to review preview').click();capture('03-rosa-review')
 goto('rosa',pattern='signoff');expect(page.get_by_role('button',name='Confirm preview review')).to_be_disabled();page.get_by_role('combobox',name='Story state').click();page.get_by_role('option',name='Complete',exact=True).click();page.get_by_role('button',name='Confirm preview review').click();expect(page.locator('.approval-row')).to_contain_text(['Local review','Not collected']);page.get_by_role('checkbox',name='Manager required in this preview configuration').check();expect(page.locator('.approval-row')).to_have_count(3);capture('03-rosa-signoff')
 for pattern in ['assignment','people','header','evidence','footer','sections','progress','system']:
  goto('rosa',pattern=pattern);expect(page.locator('.ds-device')).to_be_visible()
 assert storage()==before,'Explorer must never write theme or assessment preferences'
 # True token parity with the actual Rosa route, not a copied swatch table.
 page.goto(args.url+'/?version=5');expect(page.locator('.flow-v5')).to_be_visible();assert page.evaluate('getComputedStyle(document.documentElement).getPropertyValue("--spatial-iris").trim()')==iris
 # Responsive views and unique labels across the shared composition.
 for width in [320,375,390,419]:
  page.set_viewport_size({'width':width,'height':844})
  for area,kwargs in [('foundations',{}),('components',{'component':'button'}),('rosa',{'pattern':'card'})]:
   goto(area,**kwargs)
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(width,area,'page overflow')
   if area!='foundations':page.locator('#ds-section-heading').scroll_into_view_if_needed()
   if area=='rosa':
    assert page.locator('.ds-device').evaluate('(e)=>e.scrollWidth<=e.clientWidth'),(width,'device overflow')
    assert page.locator('.spatial-live-card').evaluate('(e)=>e.scrollWidth<=e.clientWidth'),(width,'card overflow')
   capture(f'{area}-{width}')
  if width==390:page.locator('.ds-device').screenshot(path=str(shots/'03-rosa-mobile-preview.png'))
  print(f'PASS foundations/core/Rosa at {width}px',flush=True)
 page.emulate_media(reduced_motion='reduce');goto('rosa',pattern='card')
 assert page.locator('.spatial-question-body').evaluate('(e)=>getComputedStyle(e).animationName')=='none'
 page.add_style_tag(content='.ds-device .spatial-question-title{font-size:32px!important}.ds-device .spatial-question-description{font-size:22px!important}')
 assert page.locator('.spatial-live-card').evaluate('(e)=>e.scrollWidth<=e.clientWidth')
 assert storage()==before,'Responsive/motion examples must not persist drafts'
 # Theme Studio remains the actual editor and CSS export path.
 page.emulate_media(reduced_motion='no-preference');page.set_viewport_size({'width':1440,'height':1000});page.goto(args.url+'/?studio=1')
 expect(page.get_by_role('heading',name='Theme Studio',exact=True)).to_be_visible();assert page.locator('.ds-explorer').count()==0
 slider=page.get_by_role('slider',name='Arredondamento');slider.focus();slider.press('End');slider.press('ArrowLeft')
 assert abs(json.loads(page.evaluate('localStorage.getItem("lp-theme-studio-v2")'))['radius']-23.9)<0.01
 page.get_by_role('button',name='Exportar CSS',exact=True).click();expect(page.get_by_role('textbox',name='CSS do tema')).to_contain_text('--radius');page.keyboard.press('Escape')
 page.goto(args.url+'/?preview=1');expect(page.get_by_role('heading',name='Small details.',exact=False)).to_be_visible()
 for version in [2,3,4]:
  page.goto(args.url+f'/?version={version}');expect(page.locator('.flow-v5')).to_have_count(0)
  page.get_by_role('button',name='Start Assessment',exact=True).click();expect(page.get_by_role('radio')).to_have_count(3)
 assert not errors,errors
 print('PASS shared Rosa patterns, safe media/sign-off, storage isolation, token parity, accessibility, Theme Studio editing/export and V2–V4 regression.',flush=True)
 browser.close()
