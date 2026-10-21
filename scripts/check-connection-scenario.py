"""Presentation-only connectivity simulation, actual React build and isolated browser data."""
import base64,json,re
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
OUT=Path('docs/rosa-connection-scenario');OUT.mkdir(parents=True,exist_ok=True)
BASE='http://127.0.0.1:5181/?version=5&brandDemo=1';KEY='lp-rosa-flow-v5-v01'
OFFLINE='You’re offline. Keep assessing — your progress is saved on this device.';RECOVERY='You’re back online. Your progress is synced.'
results=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for theme in ['spatial','fluid']:
  c=b.new_context(viewport={'width':1440,'height':1000},is_mobile=True,has_touch=True,reduced_motion='reduce');p=c.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
  url=BASE+'&visualTheme='+theme;p.goto(url);p.locator('.screen').wait_for()
  draft=dict(screen='assessment',index=8,started=True,answers={str(i):'met' for i in range(8)},notes={},feedback='',offline=False,paused=False,assessorConfirmed=False)
  p.evaluate('(d)=>localStorage.setItem("'+KEY+'",JSON.stringify(d))',draft);p.reload();expect(p.locator('.spatial-position')).to_have_text('Task 9 of 11')
  panel=p.get_by_role('complementary',name='External preview controls');control=panel.get_by_role('region',name='Connection scenario')
  assert not p.locator('.phone').evaluate('(e)=>e.contains(document.querySelector(".spatial-connection-scenario"))')
  assert panel.bounding_box()['x']>=p.locator('.phone').bounding_box()['x']+p.locator('.phone').bounding_box()['width']
  expect(control.get_by_label('Simulated connection: Online',exact=True)).to_be_visible()
  before=p.evaluate('localStorage.getItem("'+KEY+'")');online=p.evaluate('navigator.onLine');history_len=p.evaluate('history.length')
  fetches=[];p.on('request',lambda req:fetches.append(req.url) if req.resource_type in ['fetch','xhr'] else None)
  control.get_by_role('button',name='Simulate connection loss',exact=True).focus();p.keyboard.press('Enter')
  expect(control.get_by_label('Simulated connection: Offline',exact=True)).to_be_visible();expect(p.get_by_text(OFFLINE,exact=True)).to_be_visible()
  assert p.evaluate('localStorage.getItem("'+KEY+'")')==before;assert p.evaluate('navigator.onLine')==online
  assert p.evaluate('history.length')==history_len
  expect(p.get_by_role('button',name='Next',exact=True)).to_be_disabled()
  p.screenshot(path=str(OUT/f'{theme}-offline-desktop.png'))
  # No network-dependent guard is added; both required modalities still gate Next.
  p.get_by_role('radio',name='Fail',exact=True).check();p.get_by_role('textbox',name='Comment',exact=True).fill('Observed product quality during interruption.')
  expect(p.get_by_role('button',name='Next',exact=True)).to_be_disabled();p.wait_for_timeout(250)
  p.locator('input[aria-label="Take photo"]').nth(8).set_input_files({'name':'offline-photo.png','mimeType':'image/png','buffer':base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=')})
  expect(p.get_by_role('button',name='Next',exact=True)).to_be_enabled();p.get_by_role('button',name='Next',exact=True).click();expect(p.locator('.spatial-position')).to_have_text('Task 10 of 11')
  before=p.evaluate('localStorage.getItem("'+KEY+'")');p.clock.install()
  control.get_by_role('button',name='Restore connection',exact=True).click();expect(p.get_by_text(RECOVERY,exact=True)).to_be_visible()
  expect(control.get_by_label('Simulated connection: Online',exact=True)).to_be_visible();assert p.evaluate('localStorage.getItem("'+KEY+'")')==before
  expect(p.locator('.spatial-position')).to_have_text('Task 10 of 11');assert 'connectionScenario=' not in p.url
  p.screenshot(path=str(OUT/f'{theme}-recovered-desktop.png'))
  p.clock.fast_forward(6500);expect(p.get_by_text(RECOVERY,exact=True)).to_have_count(0)
  # Photos/notes survive recovery and reload. URL-scoped presentation state follows shortcuts.
  control.get_by_role('button',name='Simulate connection loss',exact=True).click();p.reload()
  expect(control.get_by_label('Simulated connection: Offline',exact=True)).to_be_visible()
  p.get_by_role('button',name='All tasks',exact=True).click();p.get_by_role('dialog',name='All tasks').locator('[data-task-index="8"]').click()
  expect(p.get_by_role('textbox',name='Comment',exact=True)).to_have_value('Observed product quality during interruption.')
  expect(p.get_by_role('button',name='Preview offline-photo.png',exact=True)).to_be_visible()
  expect(p.get_by_role('radio',name='Fail',exact=True)).to_be_checked()
  panel.get_by_role('button',name='Assessment Overview',exact=True).click();expect(p.locator('.screen')).to_have_attribute('data-screen','overview')
  expect(control.get_by_label('Simulated connection: Offline',exact=True)).to_be_visible();expect(p.get_by_text(OFFLINE,exact=True)).to_be_visible()
  control.get_by_role('button',name='Restore connection',exact=True).click();expect(p.get_by_text(RECOVERY,exact=True)).to_be_visible()
  # Online simulation must not claim a physically offline device is reconnected.
  control.get_by_role('button',name='Simulate connection loss',exact=True).click();c.set_offline(True);control.get_by_role('button',name='Restore connection',exact=True).click()
  expect(p.get_by_text(OFFLINE,exact=True)).to_be_visible();expect(p.get_by_text(RECOVERY,exact=True)).to_have_count(0)
  expect(control.get_by_text('Another offline state is still active. This control does not reconnect the device.',exact=True)).to_be_visible();c.set_offline(False)
  # Existing five-screen shortcuts support URL-scoped scenarios, without real sync calls.
  for page in ['overview','live','result','submission','finish']:
   p.goto(url+'&flowPreview='+page+'&connectionScenario=offline')
   if page=='finish':p.get_by_role('dialog',name='Finish assessment?').get_by_role('button',name='Close',exact=True).click()
   expect(control.get_by_label('Simulated connection: Offline',exact=True)).to_be_visible()
   control.get_by_role('button',name='Restore connection',exact=True).click();expect(p.get_by_text(RECOVERY,exact=True)).to_be_visible()
  # Narrow layouts keep the SAME panel below, never inside/over the device.
  for width in [320,390,430]:
   p.set_viewport_size({'width':width,'height':844});p.goto(url+'&flowPreview=live')
   control.get_by_role('button',name='Simulate connection loss',exact=True).click();expect(p.get_by_text(OFFLINE,exact=True)).to_be_attached()
   assert panel.bounding_box()['y']>=p.locator('.phone').bounding_box()['y']+p.locator('.phone').bounding_box()['height']-1
   assert p.evaluate('document.documentElement.scrollWidth<=innerWidth')
   control.get_by_role('button',name='Restore connection',exact=True).click();expect(p.get_by_text(RECOVERY,exact=True)).to_be_attached()
  # Reset returns both the scenario and prototype to their initial states.
  control.get_by_role('button',name='Simulate connection loss',exact=True).click();panel.get_by_role('button',name='Reset prototype',exact=True).click()
  expect(control.get_by_label('Simulated connection: Online',exact=True)).to_be_visible();expect(p.get_by_role('button',name='Open assessment for Dre Michael')).to_be_visible()
  assert not errors,errors;assert not fetches,fetches
  results.append({'theme':theme,'dataUnaffectedByToggle':True,'requiredEvidenceStillGated':True,'offlineEditingAndPhotoPersistence':True,'recoveryTemporary':True,'realOfflineNotOverridden':True,'fiveScreens':True,'narrowWidths':[320,390,430],'fetchOrXHR':fetches,'errors':errors})
  c.close()
 # No simulation controls/effect in participant mode or V2-V4.
 for query in ['?version=5&connectionScenario=offline','?version=4&brandDemo=1&connectionScenario=offline']:
  p=b.new_page();p.goto('http://127.0.0.1:5181/'+query);p.locator('.screen').wait_for();expect(p.get_by_role('button',name='Simulate connection loss',exact=True)).to_have_count(0);expect(p.get_by_text(OFFLINE,exact=True)).to_have_count(0);p.close()
 (OUT/'results.json').write_text(json.dumps(results,indent=2));print('PASS both themes: external control, immutable data/network, offline answers/evidence/Next, recovery, URL shortcuts, real offline, mobile layouts, reset and participant isolation')
 b.close()
