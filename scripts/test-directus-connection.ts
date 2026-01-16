import { createDirectus, rest, authentication, readItems } from '@directus/sdk';

async function test() {
  const directus = createDirectus('https://commonplace-directus-652016456291.us-central1.run.app')
    .with(rest())
    .with(authentication());

  await directus.login('custodian@inquiry.institute', 'Jp89zfLeRuZFYhy');

  const persons = await directus.request(readItems('persons', { limit: 3 }));
  console.log('✅ Connected! Found', persons.length, 'persons');
  if (persons.length > 0) {
    console.log('Sample person:', JSON.stringify(persons[0], null, 2));
  }
}

test().catch(console.error);
