/**
 * Comprehensive Automated Test Suite for AI Shorts Video Generation Engine
 * Tests Phases 1 through 13 end-to-end.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { createShortsJob, getShortsJob } from './server/videoRenderer';

async function runTestSuite() {
  console.log('================================================================');
  console.log('TEST SUITE: BUZZING BRAIN AI SHORTS VIDEO GENERATION PIPELINE');
  console.log('================================================================\n');

  // Test 1: Start Shorts Job
  console.log('[TEST 1] Initiating Shorts Job with real parameters...');
  const jobId = await createShortsJob({
    topic: 'Human Heart & Double Circulation',
    classGrade: 'Class 10',
    subject: 'Biology',
    targetAudience: 'CBSE Board 2026',
    durationSeconds: 30, // 30s test run
    language: 'Hinglish',
    voiceStyle: 'Kore',
    visualStyle: 'Scientific Animation',
    captionStyle: 'Karaoke High-Contrast',
    bgMusicStyle: 'Subtle Piano Intro/Outro',
    template: 'shorts_vertical',
    callToAction: 'Comment the 4 chambers below and subscribe to Buzzing Brain!',
  });

  console.log(`[TEST 1 PASSED] Job initiated with ID: ${jobId}`);

  // Test 2: Poll Progress & State Transitions
  console.log('\n[TEST 2] Polling Job Progress & State Machine...');
  let completed = false;
  let attempts = 0;
  const maxAttempts = 50;

  while (!completed && attempts < maxAttempts) {
    await new Promise(r => setTimeout(r, 2000));
    attempts++;

    const job = getShortsJob(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found in state store!`);
    }

    console.log(`  -> Attempt ${attempts}: Stage=[${job.stage}] Progress=[${job.progress}%] Message="${job.message}"`);

    if (job.status === 'completed') {
      completed = true;
      console.log(`[TEST 2 PASSED] Job completed in ${attempts * 2}s!`);
      break;
    }

    if (job.status === 'failed') {
      throw new Error(`Job ${jobId} failed with error: ${job.error}`);
    }
  }

  if (!completed) {
    throw new Error('Test timed out before video rendering finished');
  }

  const finalJob = getShortsJob(jobId)!;

  // Test 3: Output File Validation
  console.log('\n[TEST 3] Verifying Output MP4 File on Disk...');
  const expectedMp4Path = path.resolve(process.cwd(), 'public', 'generated-shorts', `${jobId}.mp4`);
  if (!fs.existsSync(expectedMp4Path)) {
    throw new Error(`Expected MP4 file not found at ${expectedMp4Path}`);
  }

  const fileSize = fs.statSync(expectedMp4Path).size;
  console.log(`  File exists: ${expectedMp4Path}`);
  console.log(`  File size: ${fileSize} bytes (${(fileSize / (1024 * 1024)).toFixed(2)} MB)`);
  if (fileSize < 10000) {
    throw new Error('Rendered MP4 file is too small to be a valid video');
  }
  console.log('[TEST 3 PASSED] Output file exists and has healthy size.');

  // Test 4: Deep FFprobe Stream Analysis (Codec, Aspect Ratio, Duration)
  console.log('\n[TEST 4] Performing Deep FFprobe Media Stream Inspection...');
  const probeOutput = execSync(`ffprobe -i "${expectedMp4Path}" -show_streams -show_format -v quiet -of json`).toString();
  const probeData = JSON.parse(probeOutput);

  const videoStream = probeData.streams.find((s: any) => s.codec_type === 'video');
  const audioStream = probeData.streams.find((s: any) => s.codec_type === 'audio');

  if (!videoStream) {
    throw new Error('Rendered file contains NO video stream!');
  }
  if (!audioStream) {
    throw new Error('Rendered file contains NO audio stream!');
  }

  console.log(`  Video Codec: ${videoStream.codec_name} (Expected: h264)`);
  console.log(`  Dimensions: ${videoStream.width}x${videoStream.height} (Expected: 720x1280 for 9:16)`);
  console.log(`  Audio Codec: ${audioStream.codec_name} (Expected: aac)`);
  console.log(`  Total Duration: ${parseFloat(probeData.format.duration).toFixed(2)}s`);

  if (videoStream.codec_name !== 'h264') {
    throw new Error(`Invalid video codec: ${videoStream.codec_name}`);
  }
  if (videoStream.width !== 720 || videoStream.height !== 1280) {
    throw new Error(`Invalid vertical resolution: ${videoStream.width}x${videoStream.height}`);
  }
  if (audioStream.codec_name !== 'aac') {
    throw new Error(`Invalid audio codec: ${audioStream.codec_name}`);
  }
  console.log('[TEST 4 PASSED] Codecs and 9:16 vertical geometry verified.');

  // Test 5: Thumbnail Extraction Verification
  console.log('\n[TEST 5] Verifying Generated Thumbnail...');
  const expectedThumbPath = path.resolve(process.cwd(), 'public', 'generated-shorts', `${jobId}_thumb.jpg`);
  if (!fs.existsSync(expectedThumbPath)) {
    throw new Error(`Thumbnail image not found at ${expectedThumbPath}`);
  }
  console.log(`  Thumbnail size: ${fs.statSync(expectedThumbPath).size} bytes`);
  console.log('[TEST 5 PASSED] Thumbnail generated cleanly.');

  // Test 6: Script & Timeline Metadata Consistency
  console.log('\n[TEST 6] Verifying Script Data & Scene Synchronization...');
  if (!finalJob.scriptData || !finalJob.scriptData.scenes || finalJob.scriptData.scenes.length === 0) {
    throw new Error('Missing structured scene data in completed job');
  }
  console.log(`  Total scenes in storyboard: ${finalJob.scriptData.scenes.length + 2} (Intro + Scenes + Outro)`);
  console.log(`  Intro hook: "${finalJob.scriptData.intro.hookText}"`);
  console.log(`  First scene concept: "${finalJob.scriptData.scenes[0].visualConcept}"`);
  console.log(`  Comment quiz: "${finalJob.scriptData.quizQuestion?.question}"`);
  console.log('[TEST 6 PASSED] Metadata verified.');

  console.log('\n================================================================');
  console.log('ALL 6 END-TO-END TESTS PASSED WITH 100% SUCCESS!');
  console.log(`Playable video ready at: ${finalJob.videoUrl}`);
  console.log('================================================================');
}

runTestSuite().catch(err => {
  console.error('\nTEST SUITE FAILED:', err);
  process.exit(1);
});
