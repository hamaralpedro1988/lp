import argparse, json
from pathlib import Path
from playwright.sync_api import sync_playwright
parser=argparse.ArgumentParser();parser.add_argument('--url',default='http://127.0.0.1:5181');parser.add_argument('--axe',default='work/contrast/package/axe.min.js');parser.add_argument('--output',default='work/contrast/recheck.json');args=parser.parse_args()
out=Path(args.output);out.parent.mkdir(parents=True,exist_ok=True);results=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 p=b.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
 def audit(brand,state):
  p.evaluate('()=>Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{})))')
  p.add_script_tag(path=args.axe)
  r=p.evaluate("""async()=>{const r=await axe.run(document,{runOnly:{type:'rule',values:['color-contrast']}});return {violations:r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary,checks:n.any.map(a=>a.data)}))})),incomplete:r.incomplete.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),passes:r.passes.reduce((sum,v)=>sum+v.nodes.length,0)}}""")
  results.append({'brand':brand,'state':state,**r})
  print(brand,state,'fail',sum(len(v['nodes']) for v in r['violations']),'manual',sum(len(v['nodes']) for v in r['incomplete']),flush=True)
 for brand in ['spatial','mcdonalds','burger-king']:
  for state in ['notification','overview','live','finish','result','submission']:
   query='' if state=='notification' else '&flowPreview='+state
   p.goto(args.url+'/?version=5&brandDemo=1&brand='+brand+query)
   p.locator('.screen').wait_for()
   if state=='notification':p.get_by_role('button',name='Reset prototype').click()
   audit(brand,state)
   if state=='overview':
    for section,total in [('Preparation',3),('Frying',5),('Completion',3)]:
     p.get_by_role('button',name=f'Preview {section}: {total} tasks',exact=True).click();audit(brand,'step-'+section);p.get_by_role('dialog').get_by_role('button',name='Back to overview').click()
    p.get_by_role('switch',name='Preview Do Not Disturb').click();audit(brand,'dnd-toast')
   if state=='live':
    p.get_by_role('radio',name='Pass',exact=True).click();audit(brand,'pass')
    p.get_by_role('radio',name='Fail',exact=True).click();audit(brand,'fail')
    p.get_by_role('button',name='Open step guidance').click();audit(brand,'guidance');p.keyboard.press('Escape')
    p.get_by_role('button',name='Sections',exact=True).click();audit(brand,'sections');p.keyboard.press('Escape')
    p.get_by_role('button',name='Add photo',exact=True).click();audit(brand,'add-photo');p.keyboard.press('Escape')
   if state=='result':
    p.get_by_role('button',name='See Insights').click();audit(brand,'insights');p.keyboard.press('Escape')
    p.locator('.review-item').first.click();audit(brand,'task-details');p.keyboard.press('Escape')
   if state=='submission':
    p.get_by_role('button',name='Collect signature',exact=True).click();audit(brand,'signature')
 out.write_text(json.dumps(results,indent=2))
 b.close()
assert not any(result['violations'] for result in results), 'Contrast violations found; inspect the JSON report.'
