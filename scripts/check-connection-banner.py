"""Check actual rendered banner contrast and fixed placement in both visual themes."""
import json,re
from pathlib import Path
from playwright.sync_api import sync_playwright,expect

def luminance(css):
    rgb=[float(x)/255 for x in re.findall(r'[\d.]+',css)[:3]]
    return sum(w*(c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4) for w,c in zip([.2126,.7152,.0722],rgb))
def contrast(a,b):
    a,b=sorted([luminance(a),luminance(b)])
    return (b+.05)/(a+.05)
results=[]
with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    for theme in ['spatial','fluid']:
      for brand in ['spatial','crimson','ocean']:
       for width in [320,390,430,1440]:
        context=browser.new_context(viewport={'width':width,'height':900},is_mobile=True,has_touch=True,reduced_motion='reduce')
        page=context.new_page()
        page.goto(f'http://127.0.0.1:5181/?version=5&brandDemo=1&flowPreview=live&visualTheme={theme}&brand={brand}&connectionScenario=offline')
        banner=page.locator('.phone > .spatial-connection-banner')
        expect(banner).to_be_visible()
        def check(state):
            colors=banner.evaluate('(e)=>({foreground:getComputedStyle(e).color,background:getComputedStyle(e).backgroundColor})')
            ratio=contrast(colors['foreground'],colors['background'])
            assert ratio>=4.5,(theme,brand,state,colors,ratio)
            assert banner.get_attribute('role')=='status'
            before=banner.bounding_box()
            progress=page.locator('.spatial-top-progress').bounding_box()
            phone=page.locator('.phone').bounding_box()
            assert before['y']+before['height']<=progress['y']+.5
            assert before['x']>=phone['x']-.5 and before['x']+before['width']<=phone['x']+phone['width']+.5
            page.locator('.screen').evaluate('(e)=>{e.scrollTop=e.scrollHeight}')
            assert abs(banner.bounding_box()['y']-before['y'])<.5
            results.append(dict(theme=theme,brand=brand,width=width,state=state,contrast=round(ratio,2),**colors,aboveProgress=True,fixedDuringContentScroll=True))
        check('offline')
        page.get_by_role('button',name='Restore connection',exact=True).click()
        expect(banner).to_have_text('Connection restored. Continue assessing.')
        check('recovered')
        if brand=='spatial' and width==390:
            page.locator('.screen').evaluate('(e)=>{e.scrollTop=0}')
            page.locator('.phone').screenshot(path=f'docs/rosa-connection-scenario/{theme}-top-banner-mobile.png')
        context.close()
    browser.close()
Path('docs/rosa-connection-scenario/banner-contrast.json').write_text(json.dumps(results,indent=2)+'\n')
print(json.dumps({'renderedStates':len(results),'minimumContrast':min(r['contrast'] for r in results),'ratios':sorted(set(r['contrast'] for r in results))}))
