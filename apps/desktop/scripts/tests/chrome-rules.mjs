import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
const source=await readFile(new URL('../../chrome-extension/rules.js',import.meta.url),'utf8')
const {effectiveDomains,blockingRules}=await import(`data:text/javascript,${encodeURIComponent(source)}`)
test('only selected AND explicitly granted domains become session rules',()=>{
 const policy={active:true,domains:['youtube.com','example.com'],expiresAt:9000}
 assert.deepEqual(effectiveDomains(policy,['youtube.com'],1000),['youtube.com'])
 assert.deepEqual(effectiveDomains(policy,[],1000),[])
 assert.deepEqual(effectiveDomains({...policy,active:false},policy.domains,1000),[])
 assert.deepEqual(effectiveDomains(policy,policy.domains,9000),[])
 assert.deepEqual(effectiveDomains({...policy,expiresAt:999999},policy.domains,1000),[])
 assert.deepEqual(blockingRules(['youtube.com'])[0].condition,{requestDomains:['youtube.com'],resourceTypes:['main_frame']})
})
