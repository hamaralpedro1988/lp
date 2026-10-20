import json
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
rows=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 p=b.new_page(viewport={'width':390,'height':844})
 for theme in ['spatial','fluid']:
  for brand in ['spatial','crimson','ocean']:
   query=f'?version=5&brandDemo=1&visualTheme={theme}&brand={brand}'
   for screen in ['overview','live','result','submission']:
    p.goto('http://localhost:5181/'+query+'&flowPreview='+screen);p.locator('.phone').wait_for();p.wait_for_timeout(450)
    p.add_script_tag(path='work/contrast/package/axe.min.js')
    report=p.evaluate('''async()=>{let r=await axe.run(document.querySelector('.phone'),{runOnly:{type:'rule',values:['color-contrast']}});return {violations:r.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),incomplete:r.incomplete.length}}''')
    rows.append({'theme':theme,'brand':brand,'screen':screen,**report})
    assert not report['violations'],rows[-1]
   p.goto('http://localhost:5181/'+query+'&flowPreview=live');p.locator('.spatial-live-card').wait_for();p.wait_for_timeout(300)
   tokens=p.evaluate('''()=>{let keys=['success-bg','success-ink','success-line','fail-bg','fail-ink','fail-line','warning-bg','warning-ink','warning-line','section-bg','section-ink','progress'];return Object.fromEntries(keys.map(k=>{let e=document.createElement('i');e.style.backgroundColor='var(--spatial-'+k+')';document.body.append(e);let c=getComputedStyle(e).backgroundColor;e.remove();return [k,c]}))}''')
   if theme=='spatial' and brand=='spatial':baseline=tokens
   assert tokens==baseline,(theme,brand,tokens)
   p.get_by_role('button',name='Sections',exact=True).click();p.get_by_role('dialog').locator('.spatial-section-list button').nth(1).click();p.wait_for_timeout(400)
   badge=p.locator('.spatial-badge[data-tone=critical]')
   assert badge.evaluate('(e)=>getComputedStyle(e).backgroundColor')==tokens['warning-bg'], (theme,brand,badge.evaluate('(e)=>getComputedStyle(e).backgroundColor'),tokens['warning-bg'])
   assert badge.evaluate('(e)=>getComputedStyle(e).color')==tokens['warning-ink']
 # Explorer interactive state and export/theme switching smoke.
 p.set_viewport_size({'width':1440,'height':1000});p.goto('http://localhost:5181/?view=design-system&visualTheme=fluid&brand=ocean');p.wait_for_timeout(500)
 expect(p.get_by_role('combobox',name='Visual theme',exact=True)).to_be_visible()
 p.get_by_role('combobox',name='Token category').click();p.get_by_role('option',name='Fluid materials',exact=True).click()
 expect(p.locator('[data-token="--fluid-glass-blur"]')).to_have_text('24px')
 p.screenshot(path='docs/rosa-fluid-ui/explorer-materials.png',full_page=True)
 p.emulate_media(reduced_motion='reduce');p.goto('http://localhost:5181/?version=5&brandDemo=1&visualTheme=fluid&flowPreview=live');p.wait_for_timeout(300)
 assert p.locator('.spatial-header-back').evaluate('(e)=>getComputedStyle(e).transitionDuration.split(",").every(v=>parseFloat(v)<=0.00001)')
 b.close()
Path('docs/rosa-fluid-ui/contrast.json').write_text(json.dumps(rows,indent=2))
print('PASS: 24 axe color-contrast screen audits (no violations; incompletes recorded), exact 12 semantic roles across six combinations, rendered Critical badges, Explorer material tokens and reduced motion.')
