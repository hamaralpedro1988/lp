from playwright.sync_api import sync_playwright
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 p=b.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
 errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
 def style(selector):
  return p.locator(selector).first.evaluate('(e)=>{const s=getComputedStyle(e);return {size:s.fontSize,line:s.lineHeight,weight:s.fontWeight}}')
 def role(selector,size,line=None,weight=None):
  actual=style(selector)
  assert actual['size']==f'{size}px',(selector,actual)
  if line: assert abs(float(actual['line'][:-2])-line)<.1,(selector,actual)
  if weight: assert actual['weight']==str(weight),(selector,actual)
 for width in [320,390,419]:
  p.set_viewport_size({'width':width,'height':844})
  for page in ['overview','live','finish','result','submission']:
   p.goto(f'http://127.0.0.1:5181/?version=5&brandDemo=1&flowPreview={page}')
   p.locator('.screen').wait_for()
   p.evaluate('()=>Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{})))')
   if page=='overview':
    role('.overview-description',16,24,400);role('.overview-goals li',16,24)
    for selector in ['.overview-person-copy small','.overview-section-copy small','.spatial-before-start .overview-section-copy small','.spatial-learning-row>span']:role(selector,14,21,400)
    role('.overview-section-copy',16);role('.overview-card h2',18)
    role('.overview-start',16)
   if page=='live':
    role('.spatial-question-title',24,30,700);role('.spatial-question-description',16,24)
    role('.spatial-choice-copy small',14,21,400);role('.spatial-choice-copy strong',16)
    role('.spatial-composer textarea',16,24);role('.spatial-position',12)
   if page=='finish':
    role('[data-slot=sheet-description]',16,24,400);role('.spatial-finish-summary h2',18)
    role('.spatial-finish-summary .review-stat small',14,21,400)
   if page=='result':
    role('.spatial-review-result-detail',14,21,400);role('.spatial-review-next li>p',16,24,400)
    role('.spatial-review-summary .review-stat small',14,21,400)
    role('.spatial-review-filters [data-slot=tabs-trigger]',14)
   if page=='submission':
    role('.spatial-submission-card [data-slot=card-content]>p',16,24,400)
    role('.spatial-signature-status',14,21,400)
    role('.spatial-submission-manager small',14,21,400)
   assert p.evaluate('document.documentElement.scrollWidth<=innerWidth'),(page,width)
   p.screenshot(path=f'work/typography/{page}-{width}.png')
 print('PASS typography roles consistent across 5 screens, 320/390/419, primary/secondary sizes, weights, line heights, no overflow')
 assert not errors,errors
 b.close()
