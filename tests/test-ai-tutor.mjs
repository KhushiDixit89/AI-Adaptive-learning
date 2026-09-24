import { handleAITutorRequest } from '../src/server/aiTutorHandler.ts';
import { getChapters, validateSubjectContext } from '../src/services/curriculumService.ts';

async function runTests() {
  console.log('--- STARTING GURUMITRA AI TUTOR VERIFICATION TESTS ---\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${message}`);
      failed++;
    }
  }

  // TEST 1: Empty Question Handling
  console.log('Testing: Empty Question Validation');
  const emptyRes = await handleAITutorRequest({ message: '   ' }, { apiKey: 'test-key' });
  assert(emptyRes.status === 400, 'Empty question returns status 400');
  assert(emptyRes.body.error === 'Please enter a question.', 'Empty question returns "Please enter a question."');

  // TEST 2: Unconfigured API Key Handling
  console.log('\nTesting: Missing API Key Handling');
  const noKeyRes = await handleAITutorRequest({ message: 'What is photosynthesis?' }, { apiKey: '' });
  assert(noKeyRes.status === 503, 'Missing API key returns status 503');
  assert(noKeyRes.body.notConfigured === true, 'Returns notConfigured flag');
  assert(
    noKeyRes.body.error === 'AI Tutor API is not configured. Add OPENAI_API_KEY to the server environment.',
    'Returns exact configuration notice'
  );

  // TEST 3: Subject Cross-Bleed Fix Validation (Computer Science vs Science)
  console.log('\nTesting: Subject Accuracy and Cross-Bleed Fix');
  const csValidatesScience = validateSubjectContext('Science', 'Computer Science');
  assert(csValidatesScience === false, 'validateSubjectContext("Science", "Computer Science") must be FALSE');

  const sciValidatesSci = validateSubjectContext('Science', 'Science');
  assert(sciValidatesSci === true, 'validateSubjectContext("Science", "Science") must be TRUE');

  const csValidatesCs = validateSubjectContext('Computer Science', 'Computer Science');
  assert(csValidatesCs === true, 'validateSubjectContext("Computer Science", "Computer Science") must be TRUE');

  const csChapters = getChapters('Class 9', 'CBSE', 'Not applicable', 'Computer Science');
  const csHasMatter = csChapters.some(c => c.title.toLowerCase().includes('matter in our surroundings'));
  assert(csHasMatter === false, 'Computer Science chapters MUST NOT include "Matter in Our Surroundings"');

  const sciChapters = getChapters('Class 9', 'CBSE', 'Not applicable', 'Science');
  const sciHasMatter = sciChapters.some(c => c.title.toLowerCase().includes('matter in our surroundings'));
  assert(sciHasMatter === true, 'Science chapters MUST include "Matter in Our Surroundings"');

  // TEST 4: OpenAI Authentication Error Mapping (Real API call with invalid key)
  console.log('\nTesting: OpenAI Authentication Error (Invalid Key)');
  const invalidKeyRes = await handleAITutorRequest(
    {
      message: 'What is photosynthesis?',
      context: {
        classLevel: 'Class 9',
        board: 'CBSE',
        subject: 'Science',
        chapter: 'Matter in Our Surroundings',
        learningStyle: 'Simple',
        difficulty: 'Beginner'
      }
    },
    { apiKey: 'sk-invalid-test-key-for-verification' }
  );
  assert(invalidKeyRes.status === 401, 'Invalid OpenAI API key correctly returns status 401');
  assert(
    invalidKeyRes.body.error.includes('OpenAI API authentication failed'),
    'Returns friendly authentication failure error'
  );

  console.log(`\n========================================`);
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});
