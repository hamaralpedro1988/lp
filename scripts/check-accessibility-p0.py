import json
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
OUT=Path('docs/rosa-accessibility-13');OUT.mkdir(exist_ok=True)
BASE='http://localhost:5181/?version=5&brandDemo=1'
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 p=b.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
 errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
 for theme in ['spatial','fluid']:
  url=BASE+'&visualTheme='+theme
  p.goto(url+'&flowPreview=finish');dialog=p.get_by_role('dialog',name='Finish assessment?',exact=True);expect(dialog).to_be_visible()
  p.get_by_role('button',name='Complete assessment',exact=True).click()
  confirm=p.get_by_role('alertdialog',name='Complete assessment?',exact=True);expect(confirm).to_be_visible()
  expect(confirm.get_by_role('button',name='Keep assessing')).to_be_focused()
  p.screenshot(path=str(OUT/f'{theme}-no-drag-confirmation.png'))
  confirm.get_by_role('button',name='Keep assessing').click();expect(dialog).to_be_visible()
  p.get_by_role('button',name='Complete assessment',exact=True).click();p.get_by_role('button',name='Confirm completion',exact=True).click()
  expect(p.get_by_role('heading',name='Assessment Result',exact=True)).to_be_visible()
  receipt=json.loads(p.evaluate('localStorage.getItem("lp-rosa-flow-v5-v01-preview")'));assert receipt['completion']
  p.get_by_role('button',name='Sign Off',exact=True).click();expect(p.get_by_role('button',name='Submit assessment',exact=True)).to_be_disabled()
  p.get_by_role('button',name='Collect acknowledgement',exact=True).click()
  sheet=p.get_by_role('dialog',name='Collect acknowledgement',exact=True);expect(sheet).to_be_visible()
  expect(sheet.get_by_label('Your full name (required)',exact=True)).to_have_value('')
  expect(sheet.get_by_role('button',name='Confirm acknowledgement',exact=True)).to_be_disabled()
  sheet.get_by_label('Your full name (required)',exact=True).fill('Dre Explicit')
  expect(sheet.get_by_role('button',name='Confirm acknowledgement',exact=True)).to_be_disabled()
  sheet.get_by_role('checkbox').check();p.screenshot(path=str(OUT/f'{theme}-typed-acknowledgement.png'))
  sheet.get_by_role('button',name='Confirm acknowledgement',exact=True).click();expect(p.get_by_role('button',name='Submit assessment',exact=True)).to_be_enabled()
  saved=json.loads(p.evaluate('localStorage.getItem("lp-rosa-flow-v5-v01-preview")'))['signature']
  assert saved['name']=='Dre Explicit' and saved['method']=='typed' and saved['consent'] and saved['identity']=='unverified' and saved['strokes']==[]
  # Drawing alone must never assign a signer name or allow confirmation.
  p.goto(url+'&flowPreview=submission');p.get_by_role('button',name='Collect acknowledgement',exact=True).click()
  sheet=p.get_by_role('dialog',name='Collect acknowledgement',exact=True);sheet.get_by_role('tab',name='Draw signature',exact=True).click()
  pad=sheet.get_by_role('img',name='Draw your signature, or type your name below');box=pad.bounding_box()
  p.mouse.move(box['x']+20,box['y']+20);p.mouse.down();p.mouse.move(box['x']+80,box['y']+40,steps=6);p.mouse.up()
  expect(sheet.get_by_role('button',name='Confirm acknowledgement',exact=True)).to_be_disabled()
  sheet.get_by_label('Your full name (required)',exact=True).fill('Another explicit person');sheet.get_by_role('checkbox').check()
  sheet.get_by_role('button',name='Confirm acknowledgement',exact=True).click()
  saved=json.loads(p.evaluate('localStorage.getItem("lp-rosa-flow-v5-v01-preview")'))['signature'];assert saved['method']=='drawn' and saved['name']=='Another explicit person' and saved['strokes']
  # Answer/evidence feedback: one stable message per missing modality, not each keystroke.
  p.goto(url+'&flowPreview=live');expect(p.locator('.spatial-validation')).to_have_text('Choose Pass or Fail before continuing.')
  expect(p.get_by_role('button',name='Next',exact=True)).to_be_disabled()
  p.get_by_role('button',name='Sections',exact=True).click();p.get_by_role('dialog').locator('.spatial-section-list button').nth(8).click()
  p.get_by_role('radio',name='Fail',exact=True).check();expect(p.locator('.spatial-validation')).to_have_text('Comment and photo required before continuing.')
  p.get_by_role('textbox',name='Comment',exact=True).fill('Quality observed');expect(p.locator('.spatial-validation')).to_have_text('Photo required before continuing.')
  expect(p.get_by_role('textbox',name='Comment',exact=True)).to_have_attribute('aria-required','true')
  p.screenshot(path=str(OUT/f'{theme}-evidence-validation.png'))
  # Photo upload is actual session evidence, not a stored filename.
  p.screenshot(path=str(OUT/'sample-photo.png'));p.locator('input[aria-label="Take photo"]').nth(8).set_input_files(str(OUT/'sample-photo.png'))
  expect(p.get_by_role('button',name='Next',exact=True)).to_be_enabled()
  # Storage failure cannot produce a completed result.
  p.goto(url+'&flowPreview=finish');p.get_by_role('button',name='Complete assessment',exact=True).click()
  p.evaluate('()=>{Storage.prototype.setItem=function(){throw new Error("Storage unavailable") }}')
  p.get_by_role('button',name='Confirm completion',exact=True).click();expect(p.get_by_role('alert')).to_contain_text('Unable to complete.')
 assert not errors,errors
 b.close()
print('PASS P0: pointer completion/cancel, focus, real guard and persistence failure, typed/drawn explicit name + consent + metadata, exact answer/comment/photo feedback, real attachment, Spatial + Fluid.')
