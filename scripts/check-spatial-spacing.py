from playwright.sync_api import sync_playwright,expect
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 p=b.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True);errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
 for width in [320,390,419]:
  p.set_viewport_size({'width':width,'height':844})
  for page in ['overview','live','finish','result','submission']:
   p.goto(f'http://127.0.0.1:5181/?version=5&brandDemo=1&flowPreview={page}')
   p.locator('.screen').wait_for()
   p.evaluate('()=>Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{})))')
   assert p.evaluate('document.documentElement.scrollWidth<=innerWidth'),(width,page)
   if page=='overview':
    styles=p.evaluate("""()=>{const card=document.querySelector('.spatial-overview-people'),member=getComputedStyle(card.querySelector('.overview-member-content')),metadata=getComputedStyle(card.querySelector('.overview-metadata'));return {member:member.padding,metadata:metadata.padding,gap:metadata.gap}}""")
    horizontal='16px' if width<350 else '20px'
    expected='20px' if horizontal=='20px' else f'20px {horizontal}'
    assert styles=={'member':expected,'metadata':expected,'gap':'12px'},styles
    headers=p.locator('.overview-card [data-slot=card-header]')
    for header in headers.all():
     assert header.evaluate('(e)=>getComputedStyle(e).paddingTop')=='20px'
   if page=='live':
    card=p.locator('.spatial-live-card')
    assert card.evaluate('(e)=>getComputedStyle(e).paddingTop')=='20px'
   if page=='finish':
    dialog=p.get_by_role('dialog',name='Finish assessment?')
    expect(dialog).to_be_visible()
    phone=p.locator('.phone').bounding_box();box=dialog.bounding_box()
    assert box['width']<=phone['width']+1 and box['height']<=phone['height']+.5
   p.screenshot(path=f'work/spacing-review/{page}-{width}.png')
 print('PASS all five screens at 320/390/419, card header/member/metadata consistency, 12px row gaps, live padding, sheet containment, no overflow')
 assert not errors,errors
 b.close()
