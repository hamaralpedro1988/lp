"""Live brand switching and product/semantic parity across the actual V5 journey."""
import argparse,json
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
parser=argparse.ArgumentParser();parser.add_argument('--url',default='http://127.0.0.1:5181');parser.add_argument('--screenshots',default='work/branding/screenshots');args=parser.parse_args();out=Path(args.screenshots);out.mkdir(parents=True,exist_ok=True)
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=b.new_page(viewport={'width':390,'height':844});errors=[];page.on('pageerror',lambda e:errors.append(str(e)));metrics={}
 def settle():page.evaluate('document.fonts.ready');page.evaluate('() => Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{})))')
 def capture(name):settle();page.screenshot(path=str(out/(name+'.png')))
 def select(name):
  page.get_by_role('combobox',name='Brand preview',exact=True).click();page.get_by_role('option',name=name,exact=True).click();settle()
 def roles():return page.evaluate('''()=>{const s=getComputedStyle(document.documentElement);return Object.fromEntries(['primary','primary-hover','line','input-line','surface-gradient','choice','section-bg','section-ink','success-bg','success-ink','success-line','fail-bg','fail-ink','warning-bg','warning-ink','focus','progress-track'].map(x=>[x,s.getPropertyValue('--spatial-'+x).trim()]))}''')
 page.goto(args.url+'/?version=5&brandDemo=1');page.locator('.screen').wait_for();page.evaluate('()=>localStorage.removeItem("lp-rosa-flow-v5-v01")');page.reload();page.locator('.screen').wait_for();baseline=roles();expect(page.locator('.phone .spatial-brand-demo')).to_have_count(0)
 fixture=out/'photo.png';page.screenshot(path=str(fixture))
 for brand,name in [('spatial','Spatial'),('mcdonalds',"McDonald's"),('burger-king','Burger King')]:
  page.evaluate('()=>localStorage.removeItem("lp-rosa-flow-v5-v01")');page.reload();page.locator('.screen').wait_for();page.evaluate('()=>window.__brandReloadSentinel="still-here"');select(name)
  assert page.evaluate('window.__brandReloadSentinel')=='still-here'
  assert roles()==baseline,brand
  metrics[brand]=page.evaluate('()=>{const s=getComputedStyle(document.documentElement);return {canvas:s.getPropertyValue("--spatial-canvas-gradient"),accent:s.getPropertyValue("--spatial-brand-accent"),progress:s.getPropertyValue("--spatial-progress")}}')
  capture(brand+'-assignments')
  page.get_by_role('button',name='View Assessment',exact=True).click();capture(brand+'-overview')
  page.get_by_role('button',name='Start Assessment',exact=True).click();page.get_by_role('radio',name='Pass',exact=True).check()
  page.get_by_role('textbox',name='Comment',exact=True).fill('Brand switching must preserve this observation.')
  saved=page.evaluate('localStorage.getItem("lp-rosa-flow-v5-v01")');select('Spatial' if brand!='spatial' else "McDonald's");assert saved==page.evaluate('localStorage.getItem("lp-rosa-flow-v5-v01")');select(name)
  expect(page.get_by_role('radio',name='Pass',exact=True)).to_be_checked();expect(page.get_by_role('textbox',name='Comment',exact=True)).to_have_value('Brand switching must preserve this observation.')
  expect(page.locator('.spatial-progress-percent')).to_have_text('9%')
  fill=page.locator('.spatial-progress>span').evaluate('e=>getComputedStyle(e).backgroundColor')
  green=page.locator('.spatial-choice[data-outcome=met] [role=radio]').evaluate('e=>getComputedStyle(e).color');assert fill==green,(brand,fill,green)
  capture(brand+'-live')
  page.get_by_role('button',name='Sections',exact=True).click();capture(brand+'-sections');page.keyboard.press('Escape')
  page.evaluate('()=>localStorage.setItem("lp-rosa-flow-v5-v01",JSON.stringify({screen:"review",index:8,answers:Object.fromEntries(Array.from({length:11},(_,i)=>[i,i===4?"fail":"met"])),notes:{8:"Quality checked against standard."},feedback:"Discuss handling with Dre."}))');page.reload();page.locator('.screen').wait_for();page.locator('input[aria-label="Take photo"]').nth(8).set_input_files(str(fixture));capture(brand+'-review')
  page.get_by_role('button',name='Continue to feedback & sign-off').click();capture(brand+'-signoff')
  for width in [320,419]:
   page.set_viewport_size({'width':width,'height':844});capture(f'{brand}-signoff-{width}');assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  page.set_viewport_size({'width':390,'height':844})
  print('PASS',name,'all five screens, overlays, unchanged product/semantic roles, draft retention and visible green progress',flush=True)
 assert len({m['canvas'] for m in metrics.values()})==3
 # Switcher stays absent from the standard participant app; brand query still applies.
 page.goto(args.url+'/?version=5&brand=mcdonalds');page.locator('.screen').wait_for();expect(page.get_by_role('combobox',name='Brand preview')).to_have_count(0);assert page.locator('html').get_attribute('data-spatial-brand')=='mcdonalds'
 # Real shared core Progress and selected brand token export in the Explorer.
 page.goto(args.url+'/?view=design-system&section=components&component=progress');page.locator('.ds-explorer').wait_for()
 for name in ['Spatial',"McDonald's",'Burger King']:
  select(name);assert page.locator('[data-slot=progress-indicator]').evaluate('e=>getComputedStyle(e).backgroundColor')==fill
 page.goto(args.url+'/?view=design-system&brand=burger-king');page.locator('.ds-explorer').wait_for()
 with page.expect_download() as download:page.get_by_role('button',name='Export tokens').click()
 path=download.value.path();assert '--spatial-brand-canvas-start:' in Path(path).read_text();assert 'burger-king' in download.value.suggested_filename
 assert not errors,errors
 (out/'brand-metrics.json').write_text(json.dumps(metrics,indent=2));b.close()
 print('PASS optional demo controls, shared Progress semantics, Explorer/export and brand routing')
