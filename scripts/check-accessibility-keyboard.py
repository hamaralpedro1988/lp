from pathlib import Path
from playwright.sync_api import sync_playwright,expect
OUT=Path('docs/rosa-accessibility-13')
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for theme in ['spatial','fluid']:
  p=b.new_page(viewport={'width':390,'height':844},reduced_motion='reduce')
  p.goto(f'http://localhost:5181/?version=5&brandDemo=1&visualTheme={theme}')
  def tabto(target):
   target.wait_for()
   p.wait_for_timeout(100)
   for _ in range(90):
    if target.evaluate('(e)=>e===document.activeElement'):return
    p.keyboard.press('Tab')
   raise AssertionError('Unreachable by Tab: '+str(target))
  def activate(target):tabto(target);p.keyboard.press('Enter')
  activate(p.get_by_role('button',name='Open assessment for Dre Michael',exact=True))
  activate(p.get_by_role('button',name='Start Assessment',exact=True))
  for index in range(11):
   expect(p.locator('.spatial-position')).to_have_text(f'Task {index+1} of 11')
   radio=p.get_by_role('radio',name='Pass',exact=True);tabto(radio)
   expect(radio).not_to_be_checked();p.keyboard.press('Space');expect(radio).to_be_checked()
   if index==2:
    p.keyboard.press('ArrowRight');expect(p.get_by_role('radio',name='Fail',exact=True)).to_be_checked()
    p.keyboard.press('ArrowLeft');expect(p.get_by_role('radio',name='Pass',exact=True)).to_be_checked()
    expect(p.locator('.spatial-position')).to_have_text('Task 3 of 11')
    activate(p.get_by_role('button',name='Sections',exact=True));expect(p.get_by_role('dialog')).to_be_visible();p.keyboard.press('Escape')
    expect(p.get_by_role('button',name='Sections',exact=True)).to_be_focused()
    activate(p.get_by_role('button',name='Open step guidance',exact=True));expect(p.get_by_role('dialog',name='Step guidance')).to_be_visible();p.keyboard.press('Escape')
    expect(p.get_by_role('button',name='Open step guidance',exact=True)).to_be_focused()
    p.context.set_offline(True);expect(p.locator('.spatial-status')).to_contain_text('Offline')
    p.context.set_offline(False)
   if index==8:
    tabto(p.get_by_role('textbox',name='Comment',exact=True));p.keyboard.type('Quality observed and discussed.')
    activate(p.get_by_role('button',name='Add photo',exact=True))
    tabto(p.get_by_role('button',name='Take photo',exact=True))
    with p.expect_file_chooser() as chooser:p.keyboard.press('Enter')
    chooser.value.set_files(str(OUT/'sample-photo.png'))
    expect(p.locator('.spatial-validation')).to_have_text('Response recorded. You can continue.')
    activate(p.get_by_role('button',name='Preview sample-photo.png',exact=True));expect(p.get_by_role('dialog',name='Evidence preview',exact=True)).to_be_visible();p.keyboard.press('Escape')
    expect(p.get_by_role('button',name='Preview sample-photo.png',exact=True)).to_be_focused()
   activate(p.get_by_role('button',name='Next' if index<10 else 'Finish checklist',exact=True))
   if index<10:expect(p.locator('.spatial-question-title')).to_be_focused()
  activate(p.get_by_role('button',name='Complete assessment',exact=True));expect(p.get_by_role('button',name='Keep assessing',exact=True)).to_be_focused()
  activate(p.get_by_role('button',name='Confirm completion',exact=True));expect(p.get_by_role('heading',name='Assessment Result',exact=True)).to_be_visible()
  p.reload();expect(p.get_by_role('heading',name='Assessment Result',exact=True)).to_be_visible()
  activate(p.get_by_role('button',name='Sign Off',exact=True));activate(p.get_by_role('button',name='Collect acknowledgement',exact=True))
  tabto(p.get_by_label('Your full name (required)',exact=True));p.keyboard.type('Explicit keyboard participant')
  tabto(p.get_by_role('checkbox'));p.keyboard.press('Space');activate(p.get_by_role('button',name='Confirm acknowledgement',exact=True))
  activate(p.get_by_role('button',name='Submit assessment',exact=True));expect(p.get_by_role('dialog',name='Submission saved on this device',exact=True)).to_be_visible()
  p.screenshot(path=str(OUT/f'{theme}-keyboard-completion.png'));p.close()
 b.close()
print('PASS keyboard-only controls through all 11 tasks and sign-off; native file chooser simulated with test image; explicit confirmation, Escape restoration, offline/online, reload lock, Spatial + Fluid, reduced motion.')
