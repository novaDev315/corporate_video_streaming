# Corporate Video Streaming Platform - Manual Testing Guide

## 📋 Table of Contents

1. [Setup & Prerequisites](#setup--prerequisites)
2. [Test Environment Setup](#test-environment-setup)
3. [Feature Testing Checklist](#feature-testing-checklist)
4. [Detailed Test Cases](#detailed-test-cases)
5. [Use Case Scenarios](#use-case-scenarios)
6. [API Testing Guide](#api-testing-guide)
7. [Performance Testing](#performance-testing)
8. [Security Testing](#security-testing)

---

## Setup & Prerequisites

### Required Software
- [ ] Node.js 20+ installed
- [ ] Docker & Docker Compose installed
- [ ] PostgreSQL 15+ (or use Docker)
- [ ] Redis 7+ (or use Docker)
- [ ] Modern browser (Chrome, Firefox, Safari, Edge)
- [ ] Postman or similar API testing tool (optional)

### Installation Steps

```bash
# 1. Clone the repository
git clone <repository-url>
cd corporate_video_streaming

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# 4. Start services with Docker Compose
docker-compose up -d

# 5. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:4000
# API Docs: http://localhost:4000/api/docs
```

### Test Data Preparation

Create test accounts for different roles:

| Role | Email | Password | Use Case |
|------|-------|----------|----------|
| Admin | admin@test.com | Test@1234 | Full access |
| Content Manager | manager@test.com | Test@1234 | Upload & manage content |
| Presenter | presenter@test.com | Test@1234 | Create presentations |
| Viewer | viewer@test.com | Test@1234 | View only |

---

## Test Environment Setup

### Initial Configuration Checklist

- [ ] Database is running and accessible
- [ ] Redis is running and accessible
- [ ] Backend server starts without errors
- [ ] Frontend application loads successfully
- [ ] API documentation is accessible at `/api/docs`
- [ ] No console errors on page load
- [ ] Environment variables are properly configured

---

## Feature Testing Checklist

### ✅ 1. Authentication & Authorization

#### 1.1 User Registration
- [ ] Navigate to registration page
- [ ] Fill in all required fields (email, password, name, organization)
- [ ] Submit form
- [ ] **Expected:** User account created, redirected to dashboard
- [ ] **Verify:** User appears in database
- [ ] **Error Cases:**
  - [ ] Try duplicate email → Should show error
  - [ ] Try weak password → Should show validation error
  - [ ] Leave required fields empty → Should show validation errors

#### 1.2 User Login
- [ ] Navigate to login page (`http://localhost:3000/login`)
- [ ] Enter valid credentials
- [ ] Click "Sign in"
- [ ] **Expected:** Successfully logged in, redirected to dashboard
- [ ] **Verify:** JWT token stored in localStorage
- [ ] **Error Cases:**
  - [ ] Wrong password → "Invalid credentials" error
  - [ ] Non-existent email → "Invalid credentials" error
  - [ ] Empty fields → Validation errors

#### 1.3 SSO Authentication
- [ ] Click "Sign in with SSO" button
- [ ] **Expected:** Redirected to SSO provider
- [ ] Complete SSO flow
- [ ] **Expected:** Redirected back to app, logged in
- [ ] **Verify:** User session created

#### 1.4 Role-Based Access Control
- [ ] Login as **Viewer**
  - [ ] Can view videos
  - [ ] Cannot upload videos
  - [ ] Cannot access admin features
- [ ] Login as **Content Manager**
  - [ ] Can upload videos
  - [ ] Can edit videos
  - [ ] Cannot manage users
- [ ] Login as **Admin**
  - [ ] Can access all features
  - [ ] Can manage users
  - [ ] Can view audit logs

---

### ✅ 2. Video Upload & Management

#### 2.1 Single Video Upload
**Test Steps:**
1. [ ] Login as Content Manager
2. [ ] Navigate to Dashboard
3. [ ] Click "Upload Video" button
4. [ ] Select a video file (MP4, MOV, or AVI)
5. [ ] Fill in video details:
   - Title: "Test Video 1"
   - Description: "This is a test video"
   - Category: "Training"
6. [ ] Click "Upload Video"
7. [ ] **Expected:** Upload progress bar appears
8. [ ] **Expected:** Video status changes to "Processing"
9. [ ] Wait for transcoding to complete
10. [ ] **Expected:** Video status changes to "Ready"
11. [ ] **Verify:** Video appears in video list

**Error Cases:**
- [ ] Try uploading file >10GB → Should show error
- [ ] Try unsupported format (.txt) → Should show error
- [ ] Cancel upload mid-way → Upload should stop

#### 2.2 Bulk Video Upload
**Test Steps:**
1. [ ] Navigate to "Bulk Upload" section
2. [ ] Select multiple video files (3-5 videos)
3. [ ] For each video, provide:
   - Title
   - Description
   - Category
4. [ ] Click "Upload All"
5. [ ] **Expected:** All videos queued for upload
6. [ ] **Verify:** Progress tracker shows each video's status
7. [ ] **Expected:** All videos process successfully
8. [ ] **Verify:** All videos appear in video library

#### 2.3 Video Metadata Management
**Test Steps:**
1. [ ] Navigate to a video detail page
2. [ ] Click "Edit Video" button
3. [ ] Update the following:
   - [ ] Title
   - [ ] Description
   - [ ] Category
   - [ ] Tags (add 3-5 tags)
   - [ ] Privacy settings (Public/Private/Restricted)
4. [ ] Click "Save Changes"
5. [ ] **Expected:** Changes saved successfully
6. [ ] **Verify:** Updated metadata displays correctly
7. [ ] Refresh page
8. [ ] **Verify:** Changes persisted

#### 2.4 Video Search & Filter
**Test Steps:**
1. [ ] Navigate to video library
2. [ ] **Search by title:**
   - [ ] Type "Test Video" in search box
   - [ ] **Expected:** Only matching videos shown
3. [ ] **Filter by category:**
   - [ ] Select "Training" category
   - [ ] **Expected:** Only training videos shown
4. [ ] **Combine filters:**
   - [ ] Search + Category filter
   - [ ] **Expected:** Results match both criteria
5. [ ] **Clear filters:**
   - [ ] Click "Clear All"
   - [ ] **Expected:** All videos displayed

#### 2.5 Video Deletion
**Test Steps:**
1. [ ] Navigate to video detail page
2. [ ] Click "Delete Video" button
3. [ ] **Expected:** Confirmation dialog appears
4. [ ] Click "Confirm Delete"
5. [ ] **Expected:** Video deleted, redirected to video library
6. [ ] **Verify:** Video no longer appears in list
7. [ ] **Verify:** Video files removed from storage

---

### ✅ 3. Video Playback

#### 3.1 Basic Video Player
**Test Steps:**
1. [ ] Navigate to a video detail page
2. [ ] **Expected:** Video player loads
3. [ ] Click play button
4. [ ] **Expected:** Video plays smoothly
5. [ ] Test player controls:
   - [ ] Pause/Resume
   - [ ] Seek forward/backward
   - [ ] Volume control
   - [ ] Mute/Unmute
   - [ ] Playback speed (0.5x, 1x, 1.5x, 2x)
   - [ ] Fullscreen mode
6. [ ] **Verify:** No buffering issues
7. [ ] **Verify:** Video quality adapts to connection

#### 3.2 Adaptive Bitrate Streaming
**Test Steps:**
1. [ ] Start playing a video
2. [ ] Open browser DevTools → Network tab
3. [ ] **Verify:** HLS segments loading (.m3u8, .ts files)
4. [ ] Throttle network speed (DevTools → Network → Slow 3G)
5. [ ] **Expected:** Video quality decreases
6. [ ] **Verify:** Playback continues smoothly
7. [ ] Remove throttling
8. [ ] **Expected:** Video quality increases

#### 3.3 Analytics Tracking
**Test Steps:**
1. [ ] Start playing a video
2. [ ] Watch for 30 seconds
3. [ ] Pause for 10 seconds
4. [ ] Resume and watch to completion
5. [ ] Navigate to Analytics dashboard
6. [ ] **Verify:** View recorded
7. [ ] **Verify:** Watch time = ~40 seconds
8. [ ] **Verify:** Completion rate = 100%

---

### ✅ 4. Playlists

#### 4.1 Create Playlist
**Test Steps:**
1. [ ] Navigate to "Playlists" section
2. [ ] Click "Create Playlist"
3. [ ] Fill in details:
   - Name: "Training Series"
   - Description: "Employee onboarding videos"
   - Privacy: Private
4. [ ] Click "Create"
5. [ ] **Expected:** Playlist created successfully
6. [ ] **Verify:** Playlist appears in list

#### 4.2 Add Videos to Playlist
**Test Steps:**
1. [ ] Open the created playlist
2. [ ] Click "Add Videos"
3. [ ] Select 3-5 videos from library
4. [ ] Click "Add Selected"
5. [ ] **Expected:** Videos added to playlist
6. [ ] **Verify:** Video count updated
7. [ ] **Verify:** Videos display in order

#### 4.3 Reorder Playlist Videos
**Test Steps:**
1. [ ] Open playlist
2. [ ] Drag and drop videos to reorder
3. [ ] **Expected:** Order updates in real-time
4. [ ] Refresh page
5. [ ] **Verify:** New order persisted

#### 4.4 Remove Video from Playlist
**Test Steps:**
1. [ ] Open playlist
2. [ ] Click "Remove" on a video
3. [ ] **Expected:** Video removed from playlist
4. [ ] **Verify:** Video count decremented
5. [ ] **Verify:** Original video still exists in library

---

### ✅ 5. Live Streaming

#### 5.1 Create Live Stream
**Test Steps:**
1. [ ] Navigate to "Live Streams" section
2. [ ] Click "Create Live Stream"
3. [ ] Fill in details:
   - Title: "Company Town Hall"
   - Description: "Q4 2024 All Hands"
   - Scheduled At: [Future date/time]
   - Enable Chat: Yes
   - Enable Q&A: Yes
4. [ ] Click "Create"
5. [ ] **Expected:** Stream created
6. [ ] **Verify:** Stream key generated
7. [ ] **Verify:** RTMP URL provided

#### 5.2 Start Live Stream
**Test Steps:**
1. [ ] Copy RTMP URL and Stream Key
2. [ ] Configure OBS or streaming software:
   - Server: [RTMP URL]
   - Stream Key: [Generated Key]
3. [ ] Start streaming from OBS
4. [ ] In app, click "Start Stream"
5. [ ] **Expected:** Stream status = "Live"
6. [ ] **Expected:** HLS URL becomes available
7. [ ] Navigate to viewer page
8. [ ] **Expected:** Live video displays

#### 5.3 Live Chat
**Test Steps:**
1. [ ] Open stream as viewer
2. [ ] Type message in chat box
3. [ ] Click "Send"
4. [ ] **Expected:** Message appears in chat
5. [ ] Open stream in another browser/incognito
6. [ ] **Expected:** Message visible to other viewers
7. [ ] Test with multiple messages
8. [ ] **Verify:** Messages appear in order
9. [ ] **Verify:** Timestamp displayed

#### 5.4 Live Q&A
**Test Steps:**
1. [ ] During live stream, click "Ask Question"
2. [ ] Type question: "When will we launch the new product?"
3. [ ] Submit question
4. [ ] **Expected:** Question appears in Q&A panel
5. [ ] As presenter, click "Answer" on question
6. [ ] Type answer and submit
7. [ ] **Expected:** Answer displays below question
8. [ ] **Verify:** All viewers see Q&A

#### 5.5 End Live Stream
**Test Steps:**
1. [ ] Stop streaming in OBS
2. [ ] In app, click "End Stream"
3. [ ] **Expected:** Stream status = "Ended"
4. [ ] **Expected:** Recording available as VOD
5. [ ] **Verify:** Viewer count statistics saved
6. [ ] **Verify:** Chat history saved

---

### ✅ 6. Interactive Features

#### 6.1 Video Comments
**Test Steps:**
1. [ ] Navigate to a video
2. [ ] Scroll to comments section
3. [ ] Type comment: "Great video!"
4. [ ] Click "Post Comment"
5. [ ] **Expected:** Comment appears
6. [ ] **Verify:** User name and timestamp shown
7. [ ] Add timestamp-based comment:
   - [ ] Pause at 1:30
   - [ ] Add comment: "Good point here"
   - [ ] **Expected:** Timestamp attached (1:30)
8. [ ] Test reply to comment:
   - [ ] Click "Reply" on a comment
   - [ ] Type reply and submit
   - [ ] **Expected:** Reply nested under original
9. [ ] Test edit comment:
   - [ ] Click "Edit" on your comment
   - [ ] Modify text and save
   - [ ] **Expected:** Comment updated

#### 6.2 Video Reactions
**Test Steps:**
1. [ ] Navigate to a video
2. [ ] Click each reaction button:
   - [ ] Like 👍
   - [ ] Love ❤️
   - [ ] Clap 👏
   - [ ] Idea 💡
   - [ ] Question ❓
3. [ ] **Expected:** Reaction count increases
4. [ ] **Expected:** Your reaction highlighted
5. [ ] Click same reaction again
6. [ ] **Expected:** Reaction removed
7. [ ] **Verify:** Reaction summary accurate

#### 6.3 Video Chapters
**Test Steps:**
1. [ ] As Content Manager, edit a video
2. [ ] Add chapters:
   - 0:00 - "Introduction"
   - 1:30 - "Main Content"
   - 5:00 - "Q&A"
   - 8:00 - "Conclusion"
3. [ ] Save changes
4. [ ] Return to video player
5. [ ] **Verify:** Chapters appear in player
6. [ ] Click on "Main Content" chapter
7. [ ] **Expected:** Video seeks to 1:30
8. [ ] **Verify:** Chapter navigation works for all

#### 6.4 In-Video Quizzes
**Test Steps:**
1. [ ] As Content Manager, edit a video
2. [ ] Add quiz at 2:00 mark:
   - Question: "What is the company's core value?"
   - Type: Multiple Choice
   - Options: ["Innovation", "Integrity", "Speed", "Quality"]
   - Correct Answer: "Integrity"
   - Pause video: Yes
3. [ ] Save quiz
4. [ ] Play video as viewer
5. [ ] At 2:00, **Expected:** Video pauses
6. [ ] **Expected:** Quiz appears
7. [ ] Select wrong answer
8. [ ] **Expected:** "Incorrect" message shown
9. [ ] Try again with correct answer
10. [ ] **Expected:** "Correct!" message
11. [ ] **Expected:** Video resumes

---

### ✅ 7. AI Transcription & Subtitles

#### 7.1 Automatic Transcription
**Test Steps:**
1. [ ] Upload a video with clear speech
2. [ ] Wait for transcoding to complete
3. [ ] Navigate to video details
4. [ ] **Verify:** "Transcript" tab available
5. [ ] Click "Transcript" tab
6. [ ] **Expected:** Transcript generated
7. [ ] **Verify:** Transcript text accurate
8. [ ] **Verify:** Timestamps aligned with speech

#### 7.2 Edit Transcript
**Test Steps:**
1. [ ] Open video transcript
2. [ ] Click "Edit Transcript"
3. [ ] Modify some text
4. [ ] Click "Save Changes"
5. [ ] **Expected:** Changes saved
6. [ ] **Verify:** Edited flag set to true
7. [ ] Refresh page
8. [ ] **Verify:** Edits persisted

#### 7.3 Subtitle Display
**Test Steps:**
1. [ ] Play a video with transcript
2. [ ] Click "CC" button in player
3. [ ] **Expected:** Subtitles appear
4. [ ] **Verify:** Subtitles sync with audio
5. [ ] Change playback speed to 1.5x
6. [ ] **Verify:** Subtitles still sync correctly

#### 7.4 Search Transcript
**Test Steps:**
1. [ ] Open video transcript
2. [ ] Use search box: "product launch"
3. [ ] **Expected:** Matching segments highlighted
4. [ ] Click on a search result
5. [ ] **Expected:** Video seeks to that timestamp
6. [ ] **Verify:** Video plays from searched location

#### 7.5 Download Transcript
**Test Steps:**
1. [ ] Open video transcript
2. [ ] Click "Download VTT"
3. [ ] **Expected:** .vtt file downloads
4. [ ] Open .vtt file
5. [ ] **Verify:** Proper WebVTT format
6. [ ] **Verify:** Timestamps and text present

---

### ✅ 8. Offline Downloads

#### 8.1 Prepare Download
**Test Steps:**
1. [ ] Navigate to a video
2. [ ] Click "Download Offline" button
3. [ ] **Expected:** Download quality selector appears
4. [ ] Select quality: "720p (High)"
5. [ ] Click "Prepare Download"
6. [ ] **Expected:** "Preparing download..." message
7. [ ] **Expected:** Progress indicator shows
8. [ ] Wait for preparation
9. [ ] **Expected:** "Download Ready" notification

#### 8.2 Download Video
**Test Steps:**
1. [ ] After preparation complete
2. [ ] Click "Download Video"
3. [ ] **Expected:** Browser download starts
4. [ ] **Verify:** File downloading to device
5. [ ] Wait for completion
6. [ ] **Verify:** Video file saved (.mp4)
7. [ ] Test downloaded video:
   - [ ] Open in video player
   - [ ] **Expected:** Plays offline without internet

#### 8.3 Manage Downloads
**Test Steps:**
1. [ ] Navigate to "My Downloads"
2. [ ] **Verify:** All downloads listed
3. [ ] Check download details:
   - [ ] Video title
   - [ ] Quality
   - [ ] File size
   - [ ] Downloaded date
   - [ ] Expiration date (30 days)
4. [ ] Click "Delete" on a download
5. [ ] **Expected:** Download removed
6. [ ] **Verify:** Storage freed

#### 8.4 Download Limits
**Test Steps:**
1. [ ] Download 5 videos (max limit)
2. [ ] Try to download 6th video
3. [ ] **Expected:** "Download limit reached" error
4. [ ] Delete one download
5. [ ] Try again
6. [ ] **Expected:** Download allowed

---

### ✅ 9. Chromecast & AirPlay

#### 9.1 Chromecast Detection
**Test Steps:**
1. [ ] Ensure Chromecast device on same network
2. [ ] Navigate to a video
3. [ ] **Verify:** Cast icon appears in player
4. [ ] **Verify:** Cast icon not grayed out

#### 9.2 Cast to Chromecast
**Test Steps:**
1. [ ] Click Cast icon
2. [ ] **Expected:** List of devices appears
3. [ ] Select Chromecast device
4. [ ] **Expected:** "Connecting..." message
5. [ ] **Expected:** Video starts on TV
6. [ ] **Verify:** Metadata shows on TV (title, thumbnail)
7. [ ] Test controls:
   - [ ] Pause/Play from browser
   - [ ] Seek to position
   - [ ] Adjust volume
8. [ ] **Verify:** All controls work on TV
9. [ ] Click "Stop Casting"
10. [ ] **Expected:** Playback returns to browser

#### 9.3 AirPlay Support (iOS/macOS)
**Test Steps:**
1. [ ] Open video on Safari (iOS/macOS)
2. [ ] **Verify:** AirPlay icon appears
3. [ ] Click AirPlay icon
4. [ ] **Expected:** Available devices listed
5. [ ] Select Apple TV or AirPlay device
6. [ ] **Expected:** Video plays on selected device
7. [ ] **Verify:** Controls work from device

---

### ✅ 10. Video Editing

#### 10.1 Trim Video
**Test Steps:**
1. [ ] Navigate to a video
2. [ ] Click "Edit Video" → "Trim"
3. [ ] Set start time: 0:30
4. [ ] Set end time: 2:00
5. [ ] Enter output name: "Trimmed Video"
6. [ ] Click "Trim Video"
7. [ ] **Expected:** Job queued message
8. [ ] Navigate to "My Editing Jobs"
9. [ ] **Verify:** Job shows "Processing"
10. [ ] **Verify:** Progress updates (0-100%)
11. [ ] Wait for completion
12. [ ] **Expected:** Status = "Completed"
13. [ ] **Expected:** New video created
14. [ ] Play new video
15. [ ] **Verify:** Duration = 1:30 (2:00 - 0:30)

#### 10.2 Cut Sections
**Test Steps:**
1. [ ] Click "Edit Video" → "Cut"
2. [ ] Add cut sections:
   - Cut 1: 0:10 to 0:20 (remove intro)
   - Cut 2: 1:30 to 1:45 (remove pause)
3. [ ] Click "Cut Video"
4. [ ] Wait for processing
5. [ ] **Verify:** New video created
6. [ ] **Verify:** Cut sections removed

#### 10.3 Merge Videos
**Test Steps:**
1. [ ] Click "Edit Video" → "Merge"
2. [ ] Select 3 videos to merge
3. [ ] Arrange in desired order
4. [ ] Enable transitions: Yes
5. [ ] Click "Merge Videos"
6. [ ] Wait for processing
7. [ ] **Verify:** Single merged video created
8. [ ] **Verify:** Duration = sum of all videos

#### 10.4 Add Intro
**Test Steps:**
1. [ ] Upload or select intro clip (5 seconds)
2. [ ] Select main video
3. [ ] Click "Add Intro"
4. [ ] Select intro clip
5. [ ] Click "Process"
6. [ ] Wait for completion
7. [ ] **Verify:** New video has intro prepended
8. [ ] Play video
9. [ ] **Verify:** Intro plays first, then main content

#### 10.5 Add Outro
**Test Steps:**
1. [ ] Similar to intro test
2. [ ] Select outro clip
3. [ ] Click "Add Outro"
4. [ ] Wait for processing
5. [ ] **Verify:** Outro appended at end
6. [ ] **Verify:** Seamless transition

#### 10.6 Audio Adjustment
**Test Steps:**
1. [ ] Click "Edit Video" → "Audio Level"
2. [ ] Option 1: Adjust volume
   - [ ] Set volume: 150% (louder)
   - [ ] Process
   - [ ] **Verify:** Audio louder in result
3. [ ] Option 2: Normalize audio
   - [ ] Select "Normalize"
   - [ ] Process
   - [ ] **Verify:** Consistent audio levels

#### 10.7 Edit Job Management
**Test Steps:**
1. [ ] Start an editing job
2. [ ] Navigate to "My Editing Jobs"
3. [ ] **Verify:** Job listed with:
   - [ ] Operation type
   - [ ] Status
   - [ ] Progress percentage
   - [ ] Created date
4. [ ] Click "Cancel" on pending job
5. [ ] **Expected:** Job cancelled
6. [ ] **Verify:** Status = "Failed"
7. [ ] **Verify:** Error message = "Cancelled by user"

---

### ✅ 11. Access Control & Permissions

#### 11.1 Video-Level Permissions
**Test Steps:**
1. [ ] As Admin, edit a video
2. [ ] Set permissions:
   - [ ] Restrict to Department: "Engineering"
3. [ ] Save changes
4. [ ] Login as user from Engineering dept
5. [ ] **Expected:** Video visible and accessible
6. [ ] Login as user from Marketing dept
7. [ ] **Expected:** Video not visible in list
8. [ ] Try direct URL access
9. [ ] **Expected:** "Access Denied" error

#### 11.2 Temporary Access Links
**Test Steps:**
1. [ ] Navigate to a private video
2. [ ] Click "Share" → "Create Access Link"
3. [ ] Configure:
   - [ ] Max views: 5
   - [ ] Expires in: 7 days
4. [ ] Click "Generate Link"
5. [ ] **Expected:** Unique URL created
6. [ ] Copy link
7. [ ] Open in incognito/private window
8. [ ] **Expected:** Video accessible without login
9. [ ] Refresh 5 times
10. [ ] On 6th view: **Expected:** "Max views reached"
11. [ ] Wait 7 days (or change system date)
12. [ ] **Expected:** "Link expired" error

#### 11.3 Department-Based Access
**Test Steps:**
1. [ ] Create video with Department access
2. [ ] Set: "Marketing" department only
3. [ ] Login as Marketing user
4. [ ] **Expected:** Video visible
5. [ ] Login as Engineering user
6. [ ] **Expected:** Video not visible

---

### ✅ 12. Analytics & Reporting

#### 12.1 Video Analytics
**Test Steps:**
1. [ ] Navigate to Analytics → "Video Analytics"
2. [ ] Select a video
3. [ ] **Verify:** Dashboard shows:
   - [ ] Total views
   - [ ] Unique viewers
   - [ ] Total watch time
   - [ ] Average completion rate
   - [ ] Engagement heatmap
   - [ ] Device breakdown (desktop/mobile/tablet)
   - [ ] Top viewers list

#### 12.2 Organization Analytics
**Test Steps:**
1. [ ] Navigate to Analytics → "Organization"
2. [ ] **Verify:** Dashboard shows:
   - [ ] Total videos
   - [ ] Total views across all videos
   - [ ] Total watch time
   - [ ] Active users
   - [ ] Top 10 videos by views
   - [ ] Engagement trends (graph)
3. [ ] Apply date filter: Last 30 days
4. [ ] **Expected:** Data filtered to date range
5. [ ] **Verify:** Graph updates

#### 12.3 User Analytics
**Test Steps:**
1. [ ] Navigate to "My Analytics"
2. [ ] **Verify:** Shows your viewing history:
   - [ ] Videos watched
   - [ ] Total watch time
   - [ ] Average completion rate
   - [ ] Recently watched videos
3. [ ] Click on a video in history
4. [ ] **Expected:** Navigate to that video

#### 12.4 Export Reports (CSV)
**Test Steps:**
1. [ ] Navigate to Analytics
2. [ ] Click "Export Report"
3. [ ] Select date range
4. [ ] Click "Download CSV"
5. [ ] **Expected:** CSV file downloads
6. [ ] Open CSV in Excel/Google Sheets
7. [ ] **Verify:** Data includes:
   - [ ] Video titles
   - [ ] View counts
   - [ ] Watch times
   - [ ] Completion rates
   - [ ] User data (if admin)

#### 12.5 Engagement Heatmap
**Test Steps:**
1. [ ] View video analytics
2. [ ] **Verify:** Heatmap graph displays
3. [ ] **Verify:** Shows where users:
   - [ ] Most replayed sections (peaks)
   - [ ] Drop-off points (valleys)
4. [ ] Hover over graph
5. [ ] **Expected:** Tooltip shows timestamp and engagement

---

### ✅ 13. Audit Logs

#### 13.1 View Audit Logs (Admin Only)
**Test Steps:**
1. [ ] Login as Admin
2. [ ] Navigate to "Audit Logs"
3. [ ] **Verify:** Log entries show:
   - [ ] Timestamp
   - [ ] User
   - [ ] Action (video_viewed, video_uploaded, etc.)
   - [ ] Resource (video ID, user ID)
   - [ ] IP address
4. [ ] **Verify:** Recent actions logged

#### 13.2 Filter Audit Logs
**Test Steps:**
1. [ ] Apply filters:
   - [ ] Action type: "video_uploaded"
   - [ ] User: specific user email
   - [ ] Date range: Last 7 days
2. [ ] Click "Apply Filters"
3. [ ] **Expected:** Only matching logs shown
4. [ ] Clear filters
5. [ ] **Expected:** All logs shown

#### 13.3 Export Audit Logs
**Test Steps:**
1. [ ] Click "Export Audit Logs"
2. [ ] Select date range
3. [ ] Click "Download CSV"
4. [ ] **Expected:** CSV downloads
5. [ ] **Verify:** CSV contains all log fields
6. [ ] **Verify:** Suitable for compliance review

---

## Use Case Scenarios

### Scenario 1: New Employee Onboarding

**Actors:** HR Manager, New Employee

**Steps:**
1. **HR Manager:**
   - [ ] Creates playlist: "New Employee Onboarding"
   - [ ] Adds videos: Company Overview, Benefits, IT Setup, Security Training
   - [ ] Sets access: All new employees

2. **New Employee:**
   - [ ] Receives email with onboarding playlist link
   - [ ] Clicks link, logs in
   - [ ] Watches all videos in sequence
   - [ ] Completes quizzes in security training video
   - [ ] Downloads IT Setup guide for offline viewing

3. **HR Manager:**
   - [ ] Reviews analytics
   - [ ] Verifies 100% completion
   - [ ] Checks quiz scores

**Expected Results:**
- [ ] New employee completes all training
- [ ] Quiz scores recorded
- [ ] Completion tracked in analytics
- [ ] Certificate generated (if implemented)

---

### Scenario 2: Quarterly Town Hall Meeting

**Actors:** Executive Team, All Employees

**Steps:**
1. **Communications Manager:**
   - [ ] Creates live stream: "Q4 2024 Town Hall"
   - [ ] Schedules for next Friday, 10 AM
   - [ ] Enables chat and Q&A
   - [ ] Shares link company-wide

2. **Day of Event:**
   - [ ] CEO starts streaming from conference room
   - [ ] Communications Manager starts stream in app
   - [ ] Employees join from various locations

3. **During Stream:**
   - [ ] Employees submit questions via Q&A
   - [ ] CEO answers top questions live
   - [ ] Chat used for reactions and comments
   - [ ] Peak viewers: 500+ concurrent

4. **After Stream:**
   - [ ] Recording automatically saved as VOD
   - [ ] Transcript generated
   - [ ] Highlights reel created (editing feature)
   - [ ] Shared in "Company Updates" playlist

**Expected Results:**
- [ ] Smooth live streaming experience
- [ ] All Q&A questions captured
- [ ] Recording available for those who missed it
- [ ] Analytics show engagement metrics

---

### Scenario 3: Product Training Series

**Actors:** Product Manager, Sales Team

**Steps:**
1. **Product Manager:**
   - [ ] Creates 5-part video series
   - [ ] Adds intro/outro to each video
   - [ ] Adds chapters for easy navigation
   - [ ] Creates quizzes to test understanding
   - [ ] Organizes in "Product Training" playlist

2. **Sales Team Members:**
   - [ ] Access playlist on mobile devices
   - [ ] Download videos for offline viewing
   - [ ] Watch during commute
   - [ ] Complete quizzes
   - [ ] Add comments with questions

3. **Product Manager:**
   - [ ] Reviews quiz results
   - [ ] Identifies knowledge gaps
   - [ ] Responds to comments
   - [ ] Updates videos based on feedback

**Expected Results:**
- [ ] 90%+ completion rate
- [ ] Average quiz score >80%
- [ ] Sales team confident in product knowledge
- [ ] Feedback incorporated into v2 of training

---

### Scenario 4: Compliance Training with Audit Trail

**Actors:** Compliance Officer, All Employees

**Steps:**
1. **Compliance Officer:**
   - [ ] Uploads mandatory compliance videos
   - [ ] Adds required quizzes (must score 100%)
   - [ ] Sets department-specific access
   - [ ] Enables completion tracking

2. **Employees:**
   - [ ] Receive notification of required training
   - [ ] Complete videos
   - [ ] Take quizzes (retry until 100%)
   - [ ] System records completion

3. **Compliance Officer:**
   - [ ] Reviews completion reports
   - [ ] Exports audit logs for compliance review
   - [ ] Verifies all employees certified
   - [ ] Sends reminders to incomplete users

**Expected Results:**
- [ ] 100% employee completion
- [ ] All quiz attempts logged
- [ ] Audit trail for regulators
- [ ] Certificates issued

---

### Scenario 5: Remote Team Collaboration

**Actors:** Project Manager, Remote Team

**Steps:**
1. **Project Manager:**
   - [ ] Records weekly standup
   - [ ] Uses chapters for each team update
   - [ ] Shares with team across time zones

2. **Team Members:**
   - [ ] Watch asynchronously
   - [ ] Add timestamped comments
   - [ ] React to updates
   - [ ] Ask questions in comments

3. **Follow-up:**
   - [ ] Project Manager reviews comments
   - [ ] Records response video
   - [ ] Creates playlist of all standups
   - [ ] Team can reference past updates

**Expected Results:**
- [ ] Async communication effective
- [ ] All time zones accommodated
- [ ] Discussion captured in comments
- [ ] Historical record maintained

---

## API Testing Guide

### Using Postman/Thunder Client

#### Setup Collection
1. [ ] Import API collection from `/docs/api.md`
2. [ ] Set base URL: `http://localhost:4000/api/v1`
3. [ ] Configure environment variables:
   - `base_url`: http://localhost:4000/api/v1
   - `auth_token`: [Your JWT token]

#### Test Authentication Endpoints

**POST /auth/register**
```json
{
  "email": "test@example.com",
  "password": "Test@1234",
  "firstName": "Test",
  "lastName": "User",
  "orgId": "org-uuid",
  "role": "viewer"
}
```
- [ ] Expected: 201 Created
- [ ] Response includes user object and token

**POST /auth/login**
```json
{
  "email": "test@example.com",
  "password": "Test@1234"
}
```
- [ ] Expected: 200 OK
- [ ] Save token for subsequent requests

#### Test Video Endpoints

**GET /videos**
- [ ] Expected: 200 OK
- [ ] Returns array of videos
- [ ] Test query params: `?category=training&search=test`

**POST /videos**
```json
{
  "title": "Test Video",
  "description": "API Test",
  "category": "training"
}
```
- [ ] Expected: 201 Created
- [ ] Video ID returned

**GET /videos/:id**
- [ ] Expected: 200 OK
- [ ] Returns complete video object

**PUT /videos/:id**
```json
{
  "title": "Updated Title"
}
```
- [ ] Expected: 200 OK
- [ ] Changes reflected

**DELETE /videos/:id**
- [ ] Expected: 200 OK or 204 No Content
- [ ] Video removed

#### Test Analytics Endpoints

**GET /analytics/videos/:id**
- [ ] Expected: 200 OK
- [ ] Returns analytics object with metrics

**GET /analytics/organization/:id?startDate=2024-01-01&endDate=2024-12-31**
- [ ] Expected: 200 OK
- [ ] Filtered data returned

#### Test Download Endpoints

**POST /downloads/prepare**
```json
{
  "videoId": "video-uuid",
  "quality": "720p"
}
```
- [ ] Expected: 201 Created
- [ ] Download ID returned

**GET /downloads/:id/url**
- [ ] Expected: 200 OK
- [ ] Secure download URL returned

#### Test Editing Endpoints

**POST /editing/trim**
```json
{
  "videoId": "video-uuid",
  "startTime": 10,
  "endTime": 60,
  "outputName": "Trimmed Video"
}
```
- [ ] Expected: 201 Created
- [ ] Edit job ID returned

**GET /editing/jobs/:id**
- [ ] Expected: 200 OK
- [ ] Progress and status returned

---

## Performance Testing

### Load Testing Checklist

#### Video Streaming Performance
- [ ] Concurrent viewers test:
  - [ ] Open video in 10 browsers
  - [ ] All play smoothly without buffering
  - [ ] Server CPU/memory acceptable
- [ ] Sequential load:
  - [ ] 100 users login within 1 minute
  - [ ] System remains responsive
- [ ] Upload stress test:
  - [ ] Upload 10 videos simultaneously
  - [ ] All process successfully
  - [ ] No queue overflow

#### Database Performance
- [ ] Query response times:
  - [ ] Video list: <100ms
  - [ ] Video detail: <50ms
  - [ ] Analytics query: <500ms
- [ ] Concurrent write operations:
  - [ ] 50 simultaneous view tracking events
  - [ ] All recorded correctly

#### CDN/Caching
- [ ] Video segments cached:
  - [ ] First load: 2-3s
  - [ ] Subsequent: <1s
  - [ ] Cache hit rate >80%

---

## Security Testing

### Security Checklist

#### Authentication
- [ ] Password strength enforced (min 8 chars, mixed case, number)
- [ ] Account lockout after 5 failed attempts
- [ ] JWT tokens expire after configured time
- [ ] Refresh token rotation works

#### Authorization
- [ ] Viewers cannot access admin endpoints
- [ ] Users cannot view other users' private videos
- [ ] API returns 403 for unauthorized access
- [ ] RBAC enforced on all protected routes

#### Data Protection
- [ ] Passwords hashed with bcrypt (not plaintext in DB)
- [ ] Sensitive data not in logs
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS protection (input sanitization)

#### Network Security
- [ ] HTTPS in production (not HTTP)
- [ ] CORS properly configured
- [ ] Security headers present (CSP, X-Frame-Options, etc.)
- [ ] Rate limiting active

#### File Upload Security
- [ ] File type validation (only video formats)
- [ ] File size limits enforced
- [ ] Malicious file upload rejected
- [ ] Uploaded files scanned (if AV integration)

---

## Bug Report Template

When you find a bug, document it using this template:

```markdown
### Bug Report

**Bug ID:** #001
**Severity:** High/Medium/Low
**Status:** Open/In Progress/Resolved

**Description:**
Clear description of the bug

**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happened

**Environment:**
- Browser: Chrome 120
- OS: Windows 11
- User Role: Admin
- Video ID: abc-123

**Screenshots:**
[Attach screenshots]

**Console Errors:**
```
[Paste console errors]
```

**Additional Notes:**
Any other relevant information
```

---

## Test Completion Checklist

### Final Verification

- [ ] All authentication flows tested
- [ ] All video operations tested
- [ ] All interactive features tested
- [ ] All editing operations tested
- [ ] All analytics working
- [ ] All access controls enforced
- [ ] All API endpoints tested
- [ ] Performance acceptable
- [ ] Security requirements met
- [ ] Cross-browser tested (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsive tested
- [ ] Documentation accurate
- [ ] No critical bugs remaining

### Sign-Off

**Tested By:** ___________________
**Date:** ___________________
**Test Environment:** ___________________
**Overall Status:** ✅ Pass / ❌ Fail
**Notes:** ___________________

---

## Support & Troubleshooting

### Common Issues

**Video not playing:**
- Check HLS URL is valid
- Verify video status is "Ready"
- Check browser console for errors
- Try different browser

**Upload failing:**
- Verify file size <10GB
- Check file format (MP4, MOV, AVI)
- Check network connection
- Verify server has storage space

**Login not working:**
- Verify credentials correct
- Check if account is active
- Clear browser cache
- Check backend server running

**Chromecast not detected:**
- Verify on same WiFi network
- Reload page
- Check browser supports Cast API
- Try different browser (Chrome recommended)

---

**End of Testing Guide**

For questions or issues, refer to:
- API Documentation: `/docs/api.md`
- Architecture Guide: `/docs/architecture.md`
- Deployment Guide: `/docs/deployment.md`
