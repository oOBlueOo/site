// Firebase imports
        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updatePassword, EmailAuthProvider, reauthenticateWithCredential, signInWithCustomToken, signInAnonymously, setPersistence, browserSessionPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
        import { getFirestore, doc, setDoc, getDoc, collection, query, onSnapshot, updateDoc, getDocs, addDoc, deleteDoc, orderBy, limit, startAfter, endBefore, arrayUnion, arrayRemove, where, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

        // Firebase Configuration (DIRECTLY EMBEDDED FROM USER'S PROVIDED CONFIG)
        const firebaseConfig = {
            apiKey: "AIzaSyBoptaucxFqStFsBeh4776kkIH0u1-ixJo",
            authDomain: "fivem-blue.firebaseapp.com",
            projectId: "fivem-blue",
            storageBucket: "fivem-blue.firebasestorage.app",
            messagingSenderId: "954474910294",
            appId: "1:954474910294:web:a7e41ff700177ac6fb21f7"
        };


        // Use the global __app_id variable provided by the Canvas environment
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        // Use the global __initial_auth_token variable provided by the Canvas environment
        const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

        let app, db, auth;
        let currentUserId = null;
        let isAuthReady = false;
        let currentUserData = null; // To store display name, image, role, banned, verified, bio, friends, sentRequests, receivedRequests
        let currentSearchQuery = ''; // To store the current search query
        let previousView = 'posts'; // To track where to go back from user profile view ('posts' or 'postDetail')

        // Pagination variables
        let lastVisibleDoc = null; // Stores the last document of the current page for 'next' pagination
        let firstVisibleDoc = null; // Stores the first document of the current page for 'prev' pagination
        let currentPage = 1;
        const postsPerPage = 9;
        var allFetchedPosts = []; // To store all posts fetched from Firestore

        // DOM Elements
        const authModal = document.getElementById('authModal');
        const authTitle = document.getElementById('authTitle');
        const authEmail = document.getElementById('authEmail');
        const authPassword = document.getElementById('authPassword');
        const registerFields = document.getElementById('registerFields');
        const authDisplayName = document.getElementById('authDisplayName');
        const authDisplayImage = document.getElementById('authDisplayImage');
        const rememberMeCheckbox = document.getElementById('rememberMe'); // New: Remember Me checkbox
        const authSubmitBtn = document.getElementById('authSubmitBtn');
        const toggleAuthText = document.getElementById('toggleAuthText');
        const toggleAuthMode = document.getElementById('toggleAuthMode');
        const appContent = document.getElementById('appContent');
        const userAvatar = document.getElementById('userAvatar');
        const userDisplayName = document.getElementById('userDisplayName');
        const currentUserIdDisplay = document.getElementById('currentUserIdDisplay');
        const logoutBtn = document.getElementById('logoutBtn');
        const termsBtn = document.getElementById('termsBtn');
        const termsModal = document.getElementById('termsModal');
        const closeTermsModal = document.getElementById('closeTermsModal');

        // Custom Confirmation Modal Elements
        const customConfirmModal = document.getElementById('customConfirmModal');
        const confirmModalTitle = document.getElementById('confirmModalTitle');
        const confirmModalMessage = document.getElementById('confirmModalMessage');
        const confirmModalYesBtn = document.getElementById('confirmModalYesBtn');
        const confirmModalNoBtn = document.getElementById('confirmModalNoBtn');

        // Edit Post Modal Elements
        const editPostModal = document.getElementById('editPostModal');
        const closeEditPostModal = document.getElementById('closeEditPostModal');
        const editPostId = document.getElementById('editPostId');
        const editPostCollectionName = document.getElementById('editPostCollectionName');
        const editPostTitle = document.getElementById('editPostTitle');
        const editPostContent = document.getElementById('editPostContent');
        const editPostImageUrl = document.getElementById('editPostImageUrl');
        const editPostVideoUrl = document.getElementById('editPostVideoUrl');
        const saveEditedPostBtn = document.getElementById('saveEditedPostBtn');

        // Post Detail Page Elements
        const postDetailPage = document.getElementById('postDetailPage');
        const backToPostsBtn = document.getElementById('backToPostsBtn');
        const postDetailTitle = document.getElementById('postDetailTitle');
        const postDetailAuthorAvatar = document.getElementById('postDetailAuthorAvatar');
        const postDetailAuthorDisplayName = document.getElementById('postDetailAuthorDisplayName');
        const postDetailAuthorId = document.getElementById('postDetailAuthorId');
        const postDetailTimestamp = document.getElementById('postDetailTimestamp');
        const postDetailContent = document.getElementById('postDetailContent');
        const postDetailImageSection = document.getElementById('postDetailImageSection');
        const postDetailImage = document.getElementById('postDetailImage');
        const postDetailVideoSection = document.getElementById('postDetailVideoSection');
        const postDetailVideo = document.getElementById('postDetailVideo');
        const copyCodeBtn = document.getElementById('copyCodeBtn');
        const postDetailCommentsList = document.getElementById('postDetailCommentsList');
        const postDetailCommentContent = document.getElementById('postDetailCommentContent');
        const addDetailCommentBtn = document.getElementById('addDetailCommentBtn');
        const postDetailVerifiedBadge = document.getElementById('postDetailVerifiedBadge');
        const editPostFromDetailBtn = document.getElementById('editPostFromDetailBtn');
        const deletePostFromDetailBtn = document.getElementById('deletePostFromDetailBtn');
        const banUserFromDetailBtn = document.getElementById('banUserFromDetailBtn');
        const kickUserFromDetailBtn = document.getElementById('kickUserFromDetailBtn'); // New: Kick User button on detail page


        const tabSnippets = document.getElementById('tabSnippets');
        const tabBugFixes = document.getElementById('tabBugFixes');
        const tabAskForHelp = document.getElementById('tabAskForHelp');
        const tabUserManagement = document.getElementById('tabUserManagement');
        const tabMyProfile = document.getElementById('tabMyProfile');
        const currentSectionTitle = document.getElementById('currentSectionTitle');
        const searchBar = document.getElementById('searchBar');
        const postTitleInput = document.getElementById('postTitle');
        const postContentInput = document.getElementById('postContent');
        const mediaFields = document.getElementById('mediaFields');
        const postImageUrlInput = document.getElementById('postImageUrl');
        const postVideoUrlInput = document.getElementById('postVideoUrl');
        const addPostBtn = document.getElementById('addPostBtn');
        const postsSection = document.getElementById('postsSection');
        const searchSection = document.getElementById('searchSection');
        const addPostSection = document.getElementById('addPostSection');
        const userManagementSection = document.getElementById('userManagementSection');
        const userListContainer = document.getElementById('userListContainer');
        const myProfileSection = document.getElementById('myProfileSection');
        const profileAvatarPreview = document.getElementById('profileAvatarPreview');
        const profileDisplayNameText = document.getElementById('profileDisplayNameText');
        const profileEmailText = document.getElementById('profileEmailText');
        const profileRoleText = document.getElementById('profileRoleText');
        const profileVerifiedText = document.getElementById('profileVerifiedText');
        const profileBioText = document.getElementById('profileBioText'); // New: Bio display
        const profileDisplayNameInput = document.getElementById('profileDisplayNameInput');
        const profileImageUrlInput = document.getElementById('profileImageUrlInput');
        const profileBioInput = document.getElementById('profileBioInput'); // New: Bio input
        const saveProfileBtn = document.getElementById('saveProfileBtn');
        const currentPasswordInput = document.getElementById('currentPasswordInput');
        const newPasswordInput = document.getElementById('newPasswordInput');
        const confirmNewPasswordInput = document.getElementById('confirmNewPasswordInput');
        const changePasswordBtn = document.getElementById('changePasswordBtn');
        const deleteAccountBtn = document.getElementById('deleteAccountBtn'); // New: Delete Account button
        const reauthModal = document.getElementById('reauthModal');
        const reauthPasswordInput = document.getElementById('reauthPassword');
        const reauthSubmitBtn = document.getElementById('reauthSubmitBtn');
        const closeReauthModal = document.getElementById('closeReauthModal');
        const loadingSpinner = document.getElementById('loadingSpinner');
        const messageBox = document.getElementById('messageBox');

        // Pagination DOM elements
        const paginationControls = document.getElementById('paginationControls');
        const prevPageBtn = document.getElementById('prevPageBtn');
        const nextPageBtn = document.getElementById('nextPageBtn');
        const pageInfo = document.getElementById('pageInfo');

        // User Profile View Elements (New)
        const userProfileViewSection = document.getElementById('userProfileViewSection');
        const backToPreviousViewBtn = document.getElementById('backToPreviousViewBtn');
        const viewedUserAvatar = document.getElementById('viewedUserAvatar');
        const viewedUserDisplayName = document.getElementById('viewedUserDisplayName');
        const viewedUserEmail = document.getElementById('viewedUserEmail');
        const viewedUserRole = document.getElementById('viewedUserRole');
        const viewedUserVerified = document.getElementById('viewedUserVerified');
        const viewedUserId = document.getElementById('viewedUserId');
        const viewedUserBio = document.getElementById('viewedUserBio'); // New: Bio display on viewed profile
        const friendActionButtonContainer = document.getElementById('friendActionButtonContainer'); // New: Friend action container
        const viewedUserFriendsList = document.getElementById('viewedUserFriendsList'); // New: Friends list on viewed profile
        const viewedUserPostsList = document.getElementById('viewedUserPostsList');
        const noUserPostsMessage = document.getElementById('noUserPostsMessage');
        const banUserFromProfileBtn = document.getElementById('banUserFromProfileBtn');
        const kickUserFromProfileBtn = document.getElementById('kickUserFromProfileBtn'); // New: Kick User button on user profile view
        const viewedUserCommentsList = document.getElementById('viewedUserCommentsList');
        const noUserCommentsMessage = document.getElementById('noUserCommentsMessage');

        // My Profile Friend Request/List Elements
        const receivedRequestsList = document.getElementById('receivedRequestsList');
        const myFriendsList = document.getElementById('myFriendsList');
        const sentRequestsList = document.getElementById('sentRequestsList');


        let authMode = 'login';
        let currentTab = 'snippets';
        let currentPostIdForDetail = null; // To store the ID of the post currently displayed in the detail page

        // --- Bad Word List (Basic Example) ---
        const badWordsList = [
            "badword1", "badword2", "inappropriate", "swear", "rude", "offensive",
            "crap", "damn", "ass", "bitch", "shit", "fuck", "bastard", "idiot", "moron"
        ];

        // --- Utility Functions ---

        /**
         * Displays a message box with a given message and type (success/error).
         * @param {string} message - The message to display.
         * @param {string} type - 'success' or 'error'.
         */
        function showMessage(message, type) {
            messageBox.textContent = message;
            messageBox.className = 'message-box show ' + type;
            setTimeout(() => {
                messageBox.className = 'message-box';
            }, 3000); // Hide after 3 seconds
        }

        /**
         * Shows the loading spinner.
         */
        function showLoading() {
            loadingSpinner.classList.remove('hidden');
        }

        /**
         * Hides the loading spinner.
         */
        function hideLoading() {
            loadingSpinner.classList.add('hidden');
        }

        /**
         * Extracts YouTube video ID from various YouTube URL formats.
         * @param {string} url - The YouTube video URL.
         * @returns {string|null} The YouTube video ID or null if not found.
         */
        function getYouTubeVideoId(url) {
            const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
            const match = url.match(regex);
            return match ? match[1] : null;
        }

        /**
         * Checks if the given text contains any bad words.
         * @param {string} text - The text to check.
         * @returns {boolean} True if bad words are found, false otherwise.
         */
        function containsBadWords(text) {
            const lowerCaseText = text.toLowerCase();
            for (const word of badWordsList) {
                // Use a regex with word boundaries to avoid matching parts of words (e.g., "classic" containing "ass")
                const regex = new RegExp(`\\b${word}\\b`, 'i');
                if (regex.test(lowerCaseText)) {
                    return true;
                }
            }
            return false;
        }

        /**
         * Truncates a user ID for display, showing only the first and last few characters.
         * @param {string} userId - The full user ID.
         * @returns {string} The truncated user ID.
         */
        function truncateUserId(userId) {
            if (!userId || userId.length <= 8) {
                return userId;
            }
            return `${userId.substring(0, 4)}...${userId.substring(userId.length - 4)}`;
        }

        /**
         * Generates a placeholder avatar URL.
         * @param {string} displayName - The user's display name.
         * @param {number} size - The desired size of the avatar (e.g., 40, 36).
         * @returns {string} The URL for the placeholder avatar.
         */
        function getAvatarUrl(displayName, size) {
            const initial = displayName ? displayName[0].toUpperCase() : 'U';
            return `https://placehold.co/${size}x${size}/6366f1/ffffff?text=${initial}`;
        }

        /**
         * Sanitizes HTML content to prevent XSS attacks.
         * @param {string} str - The input string.
         * @returns {string} The sanitized string.
         */
        function sanitizeHTML(str) {
            const div = document.createElement('div');
            div.appendChild(document.createTextNode(str));
            return div.innerHTML;
        }

        /**
         * Debounce function to limit the rate at which a function can fire.
         * @param {function} func - The function to debounce.
         * @param {number} delay - The delay in milliseconds.
         * @returns {function} The debounced function.
         */
        function debounce(func, delay) {
            let timeout;
            return function(...args) {
                const context = this;
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(context, args), delay);
            };
        }

        /**
         * Shows a custom confirmation modal.
         * @param {string} title - The title of the confirmation.
         * @param {string} message - The message to display.
         * @returns {Promise<boolean>} A promise that resolves to true if 'Yes' is clicked, false otherwise.
         */
        function showCustomConfirm(title, message) {
            return new Promise((resolve) => {
                confirmModalTitle.textContent = title;
                confirmModalMessage.textContent = message;
                customConfirmModal.classList.remove('hidden');

                const handleYes = () => {
                    customConfirmModal.classList.add('hidden');
                    confirmModalYesBtn.removeEventListener('click', handleYes);
                    confirmModalNoBtn.removeEventListener('click', handleNo);
                    resolve(true);
                };

                const handleNo = () => {
                    customConfirmModal.classList.add('hidden');
                    confirmModalYesBtn.removeEventListener('click', handleYes);
                    confirmModalNoBtn.removeEventListener('click', handleNo);
                    resolve(false);
                };

                confirmModalYesBtn.addEventListener('click', handleYes);
                confirmModalNoBtn.addEventListener('click', handleNo);
            });
        }

        // --- Navigation Tabs ---

        /**
         * Hides all content sections.
         */
        function hideAllSections() {
            postsSection.classList.add('hidden');
            searchSection.classList.add('hidden');
            addPostSection.classList.add('hidden');
            userManagementSection.classList.add('hidden');
            myProfileSection.classList.add('hidden');
            paginationControls.classList.add('hidden'); // Hide pagination when switching tabs
            postDetailPage.classList.add('hidden'); // Hide post detail page
            userProfileViewSection.classList.add('hidden'); // Hide user profile view

            // Unsubscribe from all comment listeners when switching tabs
            document.querySelectorAll('.comments-list').forEach(list => {
                if (list._unsubscribeComments) {
                    list._unsubscribeComments();
                }
            });
            if (unsubscribeFromPosts) unsubscribeFromPosts();
            if (unsubscribeFromUsers) unsubscribeFromUsers();
        }

        /**
         * Handles tab switching.
         * @param {string} tabName - The name of the tab to switch to.
         */
        function switchTab(tabName) {
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
            });

            document.getElementById(`tab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`).classList.add('active');

            currentTab = tabName;
            currentSectionTitle.textContent = tabName.replace(/([A-Z])/g, ' $1').trim();

            hideAllSections();

            if (tabName === 'snippets' || tabName === 'bugFixes' || tabName === 'askForHelp') {
                searchSection.classList.remove('hidden');
                addPostSection.classList.remove('hidden');
                postsSection.classList.remove('hidden');
                currentPage = 1; // Reset to first page when switching content tabs
                lastVisibleDoc = null; // Reset pagination cursors
                firstVisibleDoc = null;
                listenForPosts(currentTab, currentSearchQuery, null, 'initial');
            } else if (tabName === 'userManagement') {
                userManagementSection.classList.remove('hidden');
                listenForUsers();
            } else if (tabName === 'myProfile') {
                myProfileSection.classList.remove('hidden');
                if (currentUserData) {
                    profileDisplayNameText.textContent = currentUserData.displayName || 'N/A';
                    profileEmailText.textContent = auth.currentUser?.email || 'N/A';
                    profileRoleText.textContent = `Role: ${currentUserData.role || 'user'}`;
                    profileVerifiedText.textContent = `Verified: ${currentUserData.verified ? 'Yes' : 'No'}`;
                    profileBioText.textContent = currentUserData.bio ? `Bio: ${sanitizeHTML(currentUserData.bio)}` : 'Bio: Not set'; // New: Display bio
                    profileAvatarPreview.src = currentUserData.displayImage || getAvatarUrl(currentUserData.displayName, 100);
                    profileDisplayNameInput.value = currentUserData.displayName || '';
                    profileImageUrlInput.value = currentUserData.displayImage || '';
                    profileBioInput.value = currentUserData.bio || ''; // New: Set bio input value
                    currentPasswordInput.value = '';
                    newPasswordInput.value = '';
                    confirmNewPasswordInput.value = '';
                    renderFriendLists(); // Render friend lists on my profile
                }
            }
        }

        // --- Firebase Initialization and Authentication ---

        /**
         * Initializes Firebase and sets up authentication state listener.
         */
        async function initializeFirebase() {
            try {
                showLoading();
                app = initializeApp(firebaseConfig);
                db = getFirestore(app);
                auth = getAuth(app);

                // Determine persistence based on localStorage preference
                const rememberMePreference = localStorage.getItem('rememberMe') === 'true';
                await setPersistence(auth, rememberMePreference ? browserLocalPersistence : browserSessionPersistence);
                console.log(`Firebase persistence set to: ${rememberMePreference ? 'Local' : 'Session'}`);

                // Enable Firestore offline persistence
                try {
                    await enableIndexedDbPersistence(db);
                    console.log("Firestore offline persistence enabled successfully.");
                } catch (err) {
                    if (err.code === 'failed-precondition') {
                        console.warn("Firestore persistence could not be enabled. Likely due to multiple tabs open.");
                    } else if (err.code === 'unimplemented') {
                        console.warn("Firestore persistence not supported in this browser.");
                    } else {
                        console.error("Error enabling Firestore persistence:", err);
                    }
                }

                // Use onAuthStateChanged to handle the initial authentication state,
                // which will automatically pick up persistent sessions or custom tokens.
                onAuthStateChanged(auth, async (user) => {
                    if (user) {
                        currentUserId = user.uid;
                        await fetchUserData(currentUserId); // Always fetch user data

                        // IMPORTANT: Check for banned status immediately after fetching user data
                        if (currentUserData && currentUserData.banned) {
                            showMessage("You have been kicked/banned. Please contact support.", 'error');
                            await signOut(auth); // Force sign out to clear session
                            window.location.reload(); // Force a full page refresh for the kicked user
                            return; // Stop further UI updates for this banned user
                        }

                        updateUIForUser(); // Update UI based on fetched data and auth state

                        if (user.isAnonymous) {
                            appContent.classList.remove('hidden'); // Still show app content
                            authModal.classList.remove('hidden'); // Keep modal open for login/register
                            authTitle.textContent = 'Login / Register'; // Adjust title
                            authSubmitBtn.textContent = 'Login'; // Default to login
                            toggleAuthText.textContent = "Don't have an account?";
                            toggleAuthMode.textContent = 'Register here';
                            registerFields.classList.add('hidden'); // Hide register fields by default
                        } else {
                            appContent.classList.remove('hidden');
                            authModal.classList.add('hidden'); // Hide modal if authenticated
                        }
                        isAuthReady = true;
                        // Initial tab load based on currentTab
                        switchTab(currentTab);
                    } else {
                        // If no user is logged in (after initial persistence check or custom token attempt failed),
                        // try to sign in with the custom token provided by Canvas, or anonymously.
                        if (initialAuthToken) {
                            try {
                                await signInWithCustomToken(auth, initialAuthToken);
                                console.log("Signed in with custom token from onAuthStateChanged fallback.");
                                // The onAuthStateChanged listener will fire again with the authenticated user
                                return; // Exit to avoid double processing or showing modal prematurely
                            } catch (error) {
                                console.warn("Failed to sign in with custom token on fallback:", error);
                                // Fall through to anonymous sign-in if custom token fails
                            }
                        }
                        // If still no user, sign in anonymously as a last resort
                        if (!auth.currentUser) { // Check again in case custom token worked but onAuthStateChanged hasn't re-fired yet
                            await signInAnonymously(auth);
                            console.log("Signed in anonymously as a fallback.");
                        }

                        // Now, handle UI for anonymous/logged out state
                        currentUserId = null;
                        currentUserData = null;
                        console.log("onAuthStateChanged: User logged out or no user.");
                        appContent.classList.add('hidden');
                        authModal.classList.remove('hidden'); // Show modal for login/register
                        authTitle.textContent = 'Login';
                        authSubmitBtn.textContent = 'Login';
                        toggleAuthText.textContent = "Don't have an account?";
                        toggleAuthMode.textContent = 'Register here';
                        registerFields.classList.add('hidden');
                        isAuthReady = true;
                        updateUIForUser(); // Will show 'Guest'
                        // Clear content if logged out
                        postsSection.innerHTML = '<p class="text-center text-gray-400 col-span-full">Please log in to view posts.</p>';
                        userListContainer.innerHTML = '<p class="text-center text-gray-400">Please log in as an administrator to view user management.</p>';
                        if (unsubscribeFromPosts) unsubscribeFromPosts();
                        if (unsubscribeFromUsers) unsubscribeFromUsers();
                    }
                    hideLoading();
                });
            } catch (error) {
                console.error("Error initializing Firebase:", error);
                showMessage("Failed to initialize app. " + error.message, 'error');
                hideLoading();
            }
        }

        /**
         * Fetches user data (display name, image, role, banned status, bio, friends, requests) from Firestore.
         * @param {string} userId - The ID of the user.
         */
        async function fetchUserData(userId) {
            try {
                const newUserDocRef = doc(db, `artifacts/${appId}/user_profiles`, userId);
                const newDocSnap = await getDoc(newUserDocRef);

                if (newDocSnap.exists()) {
                    currentUserData = newDocSnap.data();
                    // Ensure friend-related arrays exist
                    currentUserData.friends = currentUserData.friends || [];
                    currentUserData.sentRequests = currentUserData.sentRequests || [];
                    currentUserData.receivedRequests = currentUserData.receivedRequests || [];
                    console.log("fetchUserData: User profile data retrieved from new path:", currentUserData);
                } else {
                    // This block handles cases where a user might exist in the old path or is completely new.
                    // For anonymous users, a profile will be created here with default 'Anonymous' displayName.
                    currentUserData = { displayName: 'Anonymous', displayImage: null, role: 'user', banned: false, verified: false, bio: '', friends: [], sentRequests: [], receivedRequests: [] };
                    console.log("fetchUserData: No user profile found, setting default:", currentUserData);
                    await setDoc(newUserDocRef, currentUserData, { merge: true });
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                showMessage("Failed to load user profile.", 'error');
                // Fallback to a default anonymous profile if fetching fails
                currentUserData = { displayName: 'Anonymous', displayImage: null, role: 'user', banned: false, verified: false, bio: '', friends: [], sentRequests: [], receivedRequests: [] };
            }
        }

        /**
         * Updates the UI based on the current user's authentication status and data.
         */
        function updateUIForUser() {
            if (auth.currentUser) { // User object exists (could be anonymous or authenticated)
                currentUserId = auth.currentUser.uid; // Ensure currentUserId is always updated

                if (auth.currentUser.isAnonymous) {
                    userDisplayName.textContent = 'Anonymous User';
                    currentUserIdDisplay.textContent = `ID: ${truncateUserId(currentUserId)}`;
                    userAvatar.src = getAvatarUrl('Anonymous', 48);
                    tabMyProfile.classList.add('hidden'); // Anonymous users don't have a profile to manage
                    mediaFields.classList.add('hidden'); // Anonymous users cannot add media
                    tabUserManagement.classList.add('hidden'); // Anonymous users cannot manage users
                } else { // Authenticated user
                    if (currentUserData) {
                        userDisplayName.textContent = currentUserData.displayName || 'Guest'; // Fallback to 'Guest' if displayName is missing
                        currentUserIdDisplay.textContent = `ID: ${currentUserData.role === 'admin' ? currentUserId : truncateUserId(currentUserId)}`;
                        userAvatar.src = currentUserData.displayImage || getAvatarUrl(currentUserData.displayName, 48);

                        if (currentUserData.role === 'admin' || currentUserData.role === 'moderator') {
                            mediaFields.classList.remove('hidden');
                        } else {
                            mediaFields.classList.add('hidden');
                        }

                        if (currentUserData.role === 'admin') {
                            tabUserManagement.classList.remove('hidden');
                        } else {
                            tabUserManagement.classList.add('hidden');
                        }
                        tabMyProfile.classList.remove('hidden');

                        // Update My Profile section previews (if user navigates there)
                        profileDisplayNameText.textContent = currentUserData.displayName || 'N/A';
                        profileEmailText.textContent = auth.currentUser?.email || 'N/A';
                        profileRoleText.textContent = `Role: ${currentUserData.role || 'user'}`;
                        profileVerifiedText.textContent = `Verified: ${currentUserData.verified ? 'Yes' : 'No'}`;
                        profileBioText.textContent = currentUserData.bio ? `Bio: ${sanitizeHTML(currentUserData.bio)}` : 'Bio: Not set';
                        profileAvatarPreview.src = currentUserData.displayImage || getAvatarUrl(currentUserData.displayName, 100);
                        profileDisplayNameInput.value = currentUserData.displayName || '';
                        profileImageUrlInput.value = currentUserData.displayImage || '';
                        profileBioInput.value = currentUserData.bio || '';
                    } else {
                        // Fallback if currentUserData somehow isn't loaded for authenticated user
                        userDisplayName.textContent = 'Authenticated User (Loading Profile...)';
                        currentUserIdDisplay.textContent = `ID: ${truncateUserId(currentUserId)}`;
                        userAvatar.src = getAvatarUrl('U', 48);
                        tabMyProfile.classList.remove('hidden'); // They should have a profile
                    }
                }
            } else { // No user object (shouldn't happen with signInAnonymously at start)
                userDisplayName.textContent = 'Guest';
                currentUserIdDisplay.textContent = 'ID: Not logged in';
                userAvatar.src = getAvatarUrl(null, 48);
                mediaFields.classList.add('hidden');
                tabUserManagement.classList.add('hidden');
                tabMyProfile.classList.add('hidden');
                console.log("updateUIForUser: No current user object.");
            }
        }

        /**
         * Checks if a display name is unique.
         * @param {string} displayName - The display name to check.
         * @param {string} excludeUserId - Optional, a user ID to exclude from the uniqueness check (for profile updates).
         * @returns {boolean} True if unique, false otherwise.
         */
        async function isDisplayNameUnique(displayName, excludeUserId = null) {
            const usersRef = collection(db, `artifacts/${appId}/user_profiles`);
            const q = query(usersRef, where('displayName', '==', displayName));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                return true; // No user found with this display name
            }
            if (querySnapshot.docs.length === 1 && querySnapshot.docs[0].id === excludeUserId) {
                return true; // Found one user, but it's the current user updating their own name to the same name
            }
            return false; // Display name already taken by another user
        }

        /**
         * Handles user login or registration.
         */
        authSubmitBtn.addEventListener('click', async () => {
            const email = authEmail.value;
            const password = authPassword.value;
            const displayName = authDisplayName.value;
            const displayImageUrl = authDisplayImage.value.trim();
            const rememberMe = rememberMeCheckbox.checked; // Get remember me state

            if (!email || !password) {
                showMessage("Please enter email and password.", 'error');
                return;
            }

            authSubmitBtn.disabled = true;
            showLoading();
            try {
                // Store rememberMe preference in localStorage
                localStorage.setItem('rememberMe', rememberMe);
                console.log(`Remember Me preference saved: ${rememberMe}`);

                if (authMode === 'register') {
                    if (!displayName) {
                        showMessage("Please enter a display name.", 'error');
                        hideLoading();
                        authSubmitBtn.disabled = false;
                        return;
                    }
                    if (containsBadWords(displayName)) {
                        showMessage("Your display name contains inappropriate language. Please review and try again.", 'error');
                        hideLoading();
                        authSubmitBtn.disabled = false;
                        return;
                    }
                    const isUnique = await isDisplayNameUnique(displayName);
                    if (!isUnique) {
                        showMessage("This display name is already taken. Please choose another.", 'error');
                        hideLoading();
                        authSubmitBtn.disabled = false;
                        return;
                    }

                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    const user = userCredential.user;

                    let userRole = 'user';
                    if (email === 'admin@example.com' || email === 'bigs123@gmail.com' || email === 'ronaldsidwell1991@gmail.com') {
                        userRole = 'admin';
                    }
                    console.log(`Registering user ${email} with role: ${userRole}`);

                    const userDocRef = doc(db, `artifacts/${appId}/user_profiles`, user.uid);
                    await setDoc(userDocRef, {
                        displayName: displayName,
                        displayImage: displayImageUrl || null,
                        email: email,
                        role: userRole,
                        banned: false,
                        verified: false,
                        bio: '',
                        friends: [],
                        sentRequests: [],
                        receivedRequests: [],
                        createdAt: new Date()
                    });
                    showMessage("Registration successful! You are now logged in.", 'success');
                } else {
                    await signInWithEmailAndPassword(auth, email, password);
                    showMessage("Login successful!", 'success');
                }
            } catch (error) {
                console.error("Auth error:", error);
                showMessage("Authentication failed: " + error.message, 'error');
            } finally {
                hideLoading();
                authSubmitBtn.disabled = false;
            }
        });

        /**
         * Toggles between login and registration forms.
         */
        toggleAuthMode.addEventListener('click', (e) => {
            e.preventDefault();
            if (authMode === 'login') {
                authMode = 'register';
                authTitle.textContent = 'Register';
                authSubmitBtn.textContent = 'Register';
                toggleAuthText.textContent = 'Already have an account?';
                toggleAuthMode.textContent = 'Login here';
                registerFields.classList.remove('hidden');
            } else {
                authMode = 'login';
                authTitle.textContent = 'Login';
                authSubmitBtn.textContent = 'Login';
                toggleAuthText.textContent = "Don't have an account?";
                toggleAuthMode.textContent = 'Register here';
                registerFields.classList.add('hidden');
            }
        });

        /**
         * Handles user logout.
         */
        logoutBtn.addEventListener('click', async () => {
            logoutBtn.disabled = true;
            try {
                showLoading();
                localStorage.removeItem('rememberMe'); // Clear preference on logout
                await signOut(auth);
                showMessage("Logged out successfully.", 'success');
            }
            catch (error) {
                console.error("Logout error:", error);
                showMessage("Failed to log out: " + error.message, 'error');
            } finally {
                hideLoading();
                logoutBtn.disabled = false;
            }
        });

        /**
         * Shows the Terms and Conditions modal.
         */
        termsBtn.addEventListener('click', () => {
            termsModal.classList.remove('hidden');
        });

        /**
         * Hides the Terms and Conditions modal.
         */
        closeTermsModal.addEventListener('click', () => {
            termsModal.classList.add('hidden');
        });

        // --- Reauthentication Logic ---
        let reauthCallback = null;

        closeReauthModal.addEventListener('click', () => {
            reauthModal.classList.add('hidden');
            reauthPasswordInput.value = '';
            reauthCallback = null;
        });

        reauthSubmitBtn.addEventListener('click', async () => {
            const password = reauthPasswordInput.value;
            if (!password) {
                showMessage("Please enter your current password.", 'error');
                return;
            }

            reauthSubmitBtn.disabled = true;
            showLoading();
            try {
                const user = auth.currentUser;
                const credential = EmailAuthProvider.credential(user.email, password);
                await reauthenticateWithCredential(user, credential);

                showMessage("Re-authentication successful!", 'success');
                reauthModal.classList.add('hidden');
                reauthPasswordInput.value = '';
                if (reauthCallback) {
                    reauthCallback();
                    reauthCallback = null;
                }
            } catch (error) {
                console.error("Re-authentication failed:", error);
                if (error.code === 'auth/wrong-password') {
                    showMessage("Incorrect current password.", 'error');
                } else if (error.code === 'auth/requires-recent-login') {
                    showMessage("Please re-enter your current password to proceed.", 'error');
                    reauthModal.classList.remove('hidden');
                    reauthPasswordInput.value = '';
                    reauthCallback = () => changePasswordBtn.click();
                } else {
                    showMessage("Failed to re-authenticate: " + error.message, 'error');
                }
            } finally {
                hideLoading();
                reauthSubmitBtn.disabled = false;
            }
        });


        // --- Admin Functions ---

        /**
         * Updates a user's status (e.g., banned, verified).
         * @param {string} userIdToUpdate - The ID of the user whose status to update.
         * @param {string} statusField - The field to update (e.g., 'banned', 'verified').
         * @param {any} value - The new value for the status field.
         */
        async function updateUserStatus(userIdToUpdate, statusField, value) {
            if (currentUserData?.role !== 'admin' && currentUserData?.role !== 'moderator') {
                showMessage("Permission denied. Only administrators or moderators can perform this action.", 'error');
                return;
            }
            if (userIdToUpdate === currentUserId && statusField === 'banned') {
                showMessage("You cannot ban yourself.", 'error');
                return;
            }
            if (userIdToUpdate === currentUserId && statusField === 'role') {
                 showMessage("You cannot change your own role.", 'error');
                 return;
            }

            showLoading();
            try {
                const userDocRef = doc(db, `artifacts/${appId}/user_profiles`, userIdToUpdate);
                await updateDoc(userDocRef, { [statusField]: value });
                showMessage(`User ${truncateUserId(userIdToUpdate)}'s ${statusField} status updated to ${value}.`, 'success');
                // If the currently viewed user's profile is updated, refresh it
                if (userProfileViewSection.dataset.viewedUserId === userIdToUpdate) {
                    showUserProfileView(userIdToUpdate); // Re-render the user profile view
                }
            } catch (error) {
                console.error("Error updating user status:", error);
                showMessage("Failed to update user status: " + error.message, 'error');
            } finally {
                hideLoading();
            }
        }

        /**
         * Updates a user's role.
         * @param {string} userIdToUpdate - The ID of the user whose role to update.
         * @param {string} newRole - The new role ('user', 'moderator', 'admin').
         */
        async function updateUserRole(userIdToUpdate, newRole) {
            await updateUserStatus(userIdToUpdate, 'role', newRole);
        }

        /**
         * Kicks a user by temporarily setting their banned status, forcing a re-auth.
         * @param {string} userIdToKick - The ID of the user to kick.
         */
        async function kickUser(userIdToKick) {
            if (currentUserData?.role !== 'admin' && currentUserData?.role !== 'moderator') {
                showMessage("Permission denied. Only administrators or moderators can kick users.", 'error');
                return;
            }
            if (userIdToKick === currentUserId) {
                showMessage("You cannot kick yourself.", 'error');
                return;
            }

            const confirmed = await showCustomConfirm("Confirm Kick", `Are you sure you want to kick user ${truncateUserId(userIdToKick)}? This will force them to re-authenticate.`);
            if (!confirmed) {
                return;
            }

            showLoading();
            try {
                const userDocRef = doc(db, `artifacts/${appId}/user_profiles`, userIdToKick);
                // Set banned to true
                await updateDoc(userDocRef, { banned: true });
                showMessage(`User ${truncateUserId(userIdToKick)} has been kicked.`, 'success');

                // Immediately set banned back to false after a short delay
                setTimeout(async () => {
                    await updateDoc(userDocRef, { banned: false });
                    console.log(`User ${truncateUserId(userIdToKick)}'s banned status reset.`);
                }, 500); // Short delay

            } catch (error) {
                console.error("Error kicking user:", error);
                showMessage("Failed to kick user: " + error.message, 'error');
            } finally {
                hideLoading();
            }
        }


        // --- User Management List ---
        let unsubscribeFromUsers = null;

        /**
         * Fetches and displays all user profiles for admin management.
         */
        function listenForUsers() {
            if (unsubscribeFromUsers) {
                unsubscribeFromUsers();
            }

            if (!isAuthReady || (currentUserData?.role !== 'admin' && currentUserData?.role !== 'moderator')) { // Also allow moderators to view
                userListContainer.innerHTML = '<p class="text-center text-gray-400">You must be logged in as an administrator or moderator to view user management.</p>';
                return;
            }

            const userProfilesRef = collection(db, `artifacts/${appId}/user_profiles`);
            const q = query(userProfilesRef);

            unsubscribeFromUsers = onSnapshot(q, (snapshot) => {
                userListContainer.innerHTML = '';
                if (snapshot.empty) {
                    userListContainer.innerHTML = '<p class="text-center text-gray-400">No users registered yet.</p>';
                    return;
                }

                const users = [];
                snapshot.forEach(doc => {
                    users.push({ id: doc.id, ...doc.data() });
                });

                users.sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));

                const table = document.createElement('table');
                table.className = 'user-management-table';
                table.innerHTML = `
                    <thead>
                        <tr>
                            <th>Display Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Banned</th>
                            <th>Verified</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="userTableBody"></tbody>
                `;
                userListContainer.appendChild(table);
                const userTableBody = document.getElementById('userTableBody');

                users.forEach(user => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>
                            <button class="text-blue-400 hover:underline view-user-profile-btn" data-user-id="${user.id}">
                                ${sanitizeHTML(user.displayName || 'N/A')}
                            </button>
                        </td>
                        <td>${sanitizeHTML(user.email || 'N/A')}</td>
                        <td>${user.banned ? `<span class="text-red-400 font-semibold">${sanitizeHTML(user.role || 'user')}</span>` : sanitizeHTML(user.role || 'user')}</td>
                        <td>${user.banned ? `<span class="text-red-400 font-semibold">Yes</span>` : 'No'}</td>
                        <td>${user.verified ? `<span class="text-green-400 font-semibold">Yes</span>` : 'No'}</td>
                        <td>
                            ${user.id !== currentUserId ? `
                                ${currentUserData?.role === 'admin' ? `
                                    <select class="btn btn-secondary text-xs change-role-select" data-user-id="${user.id}">
                                        <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
                                        <option value="moderator" ${user.role === 'moderator' ? 'selected' : ''}>Moderator</option>
                                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                                    </select>
                                    <button class="btn ${user.banned ? 'btn-primary' : 'btn-danger'} text-xs toggle-ban-btn" data-user-id="${user.id}" data-banned="${user.banned}">
                                        ${user.banned ? 'Unban' : 'Ban'}
                                    </button>
                                    <button class="btn ${user.verified ? 'btn-danger' : 'btn-primary'} text-xs toggle-verified-btn" data-user-id="${user.id}" data-verified="${user.verified}">
                                        ${user.verified ? 'Unverify' : 'Verify'}
                                    </button>
                                ` : ''}
                                <button class="btn btn-danger text-xs kick-user-btn" data-user-id="${user.id}">
                                    Kick
                                </button>
                            ` : 'Current User'}
                        </td>
                    `;
                    userTableBody.appendChild(row);
                });

                userTableBody.querySelectorAll('.change-role-select').forEach(select => {
                    select.addEventListener('change', async (event) => {
                        const userId = event.target.dataset.userId;
                        const newRole = event.target.value;
                        await updateUserRole(userId, newRole);
                    });
                });

                userTableBody.querySelectorAll('.toggle-ban-btn').forEach(button => {
                    button.addEventListener('click', async (event) => {
                        const userId = event.target.dataset.userId;
                        const isBanned = event.target.dataset.banned === 'true';
                        await updateUserStatus(userId, 'banned', !isBanned);
                    });
                });

                userTableBody.querySelectorAll('.toggle-verified-btn').forEach(button => {
                    button.addEventListener('click', async (event) => {
                        const userId = event.target.dataset.userId;
                        const isVerified = event.target.dataset.verified === 'true';
                        await updateUserStatus(userId, 'verified', !isVerified);
                    });
                });

                userTableBody.querySelectorAll('.kick-user-btn').forEach(button => {
                    button.addEventListener('click', async (event) => {
                        const userId = event.target.dataset.userId;
                        await kickUser(userId);
                    });
                });

                // Add event listeners for clicking user names in the table
                userTableBody.querySelectorAll('.view-user-profile-btn').forEach(button => {
                    button.addEventListener('click', (event) => {
                        const userId = event.target.dataset.userId;
                        showUserProfileView(userId);
                    });
                });

            }, (error) => {
                console.error("Error fetching users:", error);
                userListContainer.innerHTML = `<p class="text-center text-red-400">Error loading users: ${error.message}</p>`;
                showMessage("Failed to load users: " + error.message, 'error');
            });
        }


        // --- Profile Management Functions ---

        /**
         * Handles saving profile changes (display name, image, and bio).
         */
        saveProfileBtn.addEventListener('click', async () => {
            if (!currentUserId) {
                showMessage("You must be logged in to update your profile.", 'error');
                return;
            }

            const newDisplayName = profileDisplayNameInput.value.trim();
            const newProfileImageUrl = profileImageUrlInput.value.trim();
            const newProfileBio = profileBioInput.value.trim();

            if (!newDisplayName && !newProfileImageUrl && !newProfileBio) {
                showMessage("Please enter a new display name, a new image URL, or a new bio.", 'error');
                return;
            }

            if (containsBadWords(newDisplayName) || containsBadWords(newProfileBio)) {
                showMessage("Your display name or bio contains inappropriate language. Please review and try again.", 'error');
                return;
            }

            saveProfileBtn.disabled = true;
            showLoading();
            try {
                const updates = {};
                if (newDisplayName !== currentUserData.displayName) {
                    const isUnique = await isDisplayNameUnique(newDisplayName, currentUserId);
                    if (!isUnique) {
                        showMessage("This display name is already taken. Please choose another.", 'error');
                        hideLoading();
                        saveProfileBtn.disabled = false;
                        return;
                    }
                    updates.displayName = newDisplayName;
                }

                if (newProfileImageUrl !== currentUserData.displayImage) {
                    updates.displayImage = newProfileImageUrl || null;
                }

                if (newProfileBio !== currentUserData.bio) {
                    updates.bio = newProfileBio;
                }

                if (Object.keys(updates).length > 0) {
                    const userDocRef = doc(db, `artifacts/${appId}/user_profiles`, currentUserId);
                    await updateDoc(userDocRef, updates);
                    showMessage("Profile updated successfully!", 'success');
                    location.reload(); // Refresh the page to reflect changes
                } else {
                    showMessage("No changes to save.", 'info');
                }
            } catch (error) {
                console.error("Error updating profile:", error);
                showMessage("Failed to update profile: " + error.message, 'error');
            } finally {
                hideLoading();
                saveProfileBtn.disabled = false;
            }
        });

        /**
         * Handles changing user password.
         */
        changePasswordBtn.addEventListener('click', async () => {
            if (!currentUserId) {
                showMessage("You must be logged in to change your password.", 'error');
                return;
            }

            const currentPassword = currentPasswordInput.value;
            const newPassword = newPasswordInput.value;
            const confirmNewPassword = confirmNewPasswordInput.value;

            if (!currentPassword || !newPassword || !confirmNewPassword) {
                showMessage("Please fill in all password fields.", 'error');
                return;
            }
            if (newPassword !== confirmNewPassword) {
                showMessage("New password and confirm password do not match.", 'error');
                return;
            }
            if (newPassword.length < 6) {
                showMessage("New password must be at least 6 characters long.", 'error');
                return;
            }

            changePasswordBtn.disabled = true;
            showLoading();
            try {
                const user = auth.currentUser;
                const credential = EmailAuthProvider.credential(user.email, currentPassword);
                await reauthenticateWithCredential(user, credential);

                await updatePassword(user, newPassword);
                showMessage("Password updated successfully!", 'success');
                currentPasswordInput.value = '';
                newPasswordInput.value = '';
                confirmNewPasswordInput.value = '';
            } catch (error) {
                console.error("Error changing password:", error);
                if (error.code === 'auth/wrong-password') {
                    showMessage("Incorrect current password.", 'error');
                } else if (error.code === 'auth/requires-recent-login') {
                    showMessage("Please re-enter your current password to proceed.", 'error');
                    reauthModal.classList.remove('hidden');
                    reauthPasswordInput.value = '';
                    reauthCallback = () => changePasswordBtn.click();
                } else {
                    showMessage("Failed to change password: " + error.message, 'error');
                }
            } finally {
                hideLoading();
                changePasswordBtn.disabled = false;
            }
        });

        /**
         * Handles deleting the current user's account.
         */
        deleteAccountBtn.addEventListener('click', async () => {
            if (!currentUserId || auth.currentUser.isAnonymous) {
                showMessage("You must be logged in with a registered account to delete it.", 'error');
                return;
            }

            const confirmed = await showCustomConfirm("Delete Account", "Are you absolutely sure you want to delete your account? This action is irreversible and will delete all your posts and comments.");
            if (!confirmed) {
                return;
            }

            // Trigger reauthentication for security before deletion
            reauthModal.classList.remove('hidden');
            reauthPasswordInput.value = '';
            reauthCallback = async () => {
                showLoading();
                try {
                    const user = auth.currentUser;
                    const collectionsToSearch = ['snippets', 'bugFixes', 'askForHelp'];

                    // 1. Delete all comments made by the user
                    for (const col of collectionsToSearch) {
                        const postsRef = collection(db, `artifacts/${appId}/public/data/${col}`);
                        const postsSnapshot = await getDocs(postsRef);
                        for (const postDoc of postsSnapshot.docs) {
                            const commentsRef = collection(db, `artifacts/${appId}/public/data/${col}/${postDoc.id}/comments`);
                            const commentsSnapshot = await getDocs(commentsRef);
                            const commentDeletePromises = [];
                            commentsSnapshot.forEach(commentDoc => {
                                if (commentDoc.data().authorId === currentUserId) {
                                    commentDeletePromises.push(deleteDoc(doc(db, `artifacts/${appId}/public/data/${col}/${postDoc.id}/comments`, commentDoc.id)));
                                }
                            });
                            await Promise.all(commentDeletePromises);
                        }
                    }

                    // 2. Delete all posts by the user and their sub-comments
                    for (const col of collectionsToSearch) {
                        const postsRef = collection(db, `artifacts/${appId}/public/data/${col}`);
                        const q = query(postsRef, where('authorId', '==', currentUserId));
                        const userPostsSnapshot = await getDocs(q);

                        const postDeletePromises = [];
                        userPostsSnapshot.forEach(async (postDoc) => {
                            // Delete all comments within this post's subcollection
                            const commentsInPostRef = collection(db, `artifacts/${appId}/public/data/${col}/${postDoc.id}/comments`);
                            const commentsInPostSnapshot = await getDocs(commentsInPostRef);
                            commentsInPostSnapshot.forEach(commentDoc => {
                                postDeletePromises.push(deleteDoc(doc(db, `artifacts/${appId}/public/data/${col}/${postDoc.id}/comments`, commentDoc.id)));
                            });
                            // Delete the post itself
                            postDeletePromises.push(deleteDoc(doc(db, `artifacts/${appId}/public/data/${col}`, postDoc.id)));
                        });
                        await Promise.all(postDeletePromises);
                    }

                    // 3. Delete the user's profile document
                    const userDocRef = doc(db, `artifacts/${appId}/user_profiles`, currentUserId);
                    await deleteDoc(userDocRef);

                    // 4. Delete the user from Firebase Authentication
                    await user.delete();

                    showMessage("Account and all associated data deleted successfully.", 'success');
                    await signOut(auth); // Sign out after deletion
                } catch (error) {
                    console.error("Error deleting account:", error);
                    showMessage("Failed to delete account: " + error.message, 'error');
                } finally {
                    hideLoading();
                }
            };
        });


        // --- Content Management (Posts and Comments) ---

        let unsubscribeFromPosts = null; // To store the unsubscribe function for real-time updates

        /**
         * Opens the edit post modal and populates it with current post data.
         * @param {string} postId - The ID of the post to edit.
         * @param {string} collectionName - The collection the post belongs to.
         * @param {string} title - Current post title.
         * @param {string} content - Current post content.
         * @param {string} imageUrl - Current post image URL.
         * @param {string} videoUrl - Current post video URL.
         */
        function openEditPostModal(postId, collectionName, title, content, imageUrl, videoUrl) {
            editPostId.value = postId;
            editPostCollectionName.value = collectionName;
            editPostTitle.value = title;
            editPostContent.value = content;
            editPostImageUrl.value = imageUrl;
            editPostVideoUrl.value = videoUrl;
            editPostModal.classList.remove('hidden');
        }

        /**
         * Closes the edit post modal.
         */
        closeEditPostModal.addEventListener('click', () => {
            editPostModal.classList.add('hidden');
        });

        /**
         * Saves the edited post data to Firestore.
         */
        saveEditedPostBtn.addEventListener('click', async () => {
            const postId = editPostId.value;
            const collectionName = editPostCollectionName.value;
            const newTitle = editPostTitle.value.trim();
            const newContent = editPostContent.value.trim();
            const newImageUrl = editPostImageUrl.value.trim();
            const newVideoUrl = editPostVideoUrl.value.trim();

            if (!newTitle || !newContent) {
                showMessage("Title and content cannot be empty.", 'error');
                return;
            }
            if (containsBadWords(newTitle) || containsBadWords(newContent)) {
                showMessage("Your edited post contains inappropriate language. Please review and try again.", 'error');
                return;
            }

            saveEditedPostBtn.disabled = true;
            showLoading();
            try {
                const postDocRef = doc(db, `artifacts/${appId}/public/data/${collectionName}`, postId);
                await updateDoc(postDocRef, {
                    title: newTitle,
                    content: newContent,
                    postImage: newImageUrl || null,
                    postVideo: newVideoUrl || null,
                    lastEdited: new Date() // Add a last edited timestamp
                });
                showMessage("Post updated successfully!", 'success');
                editPostModal.classList.add('hidden'); // Close modal on success
                // If currently on the detail page for this post, refresh it
                if (currentPostIdForDetail === postId) {
                    // Manually update the post object for immediate UI refresh without re-fetching
                    const updatedPost = { ...allFetchedPosts.find(p => p.id === postId) }; // Create a copy
                    if (updatedPost) {
                        updatedPost.title = newTitle;
                        updatedPost.content = newContent;
                        updatedPost.postImage = newImageUrl || null;
                        updatedPost.postVideo = newVideoUrl || null;
                        showPostDetailPage(updatedPost); // Re-render the detail page
                    }
                }
            } catch (error) {
                console.error("Error updating post:", error);
                showMessage("Failed to update post: " + error.message, 'error');
            } finally {
                hideLoading();
                saveEditedPostBtn.disabled = false;
            }
        });


        /**
         * Deletes a post and all its associated comments.
         * @param {string} collectionName - The name of the Firestore collection (e.g., 'snippets').
         * @param {string} postId - The ID of the post to delete.
         */
        async function deletePost(collectionName, postId) {
            if (currentUserData?.role !== 'admin' && currentUserData?.role !== 'moderator') {
                showMessage("Permission denied. Only administrators or moderators can delete posts.", 'error');
                return;
            }

            const confirmed = await showCustomConfirm("Delete Post", "Are you sure you want to delete this post and all its comments?");
            if (!confirmed) {
                return;
            }

            showLoading();
            try {
                // 1. Delete all comments in the subcollection
                const commentsRef = collection(db, `artifacts/${appId}/public/data/${collectionName}/${postId}/comments`);
                const commentsSnapshot = await getDocs(commentsRef);
                const deletePromises = [];
                commentsSnapshot.forEach((commentDoc) => {
                    deletePromises.push(deleteDoc(doc(db, `artifacts/${appId}/public/data/${collectionName}/${postId}/comments`, commentDoc.id)));
                });
                await Promise.all(deletePromises);

                // 2. Delete the post itself
                const postDocRef = doc(db, `artifacts/${appId}/public/data/${collectionName}`, postId);
                await deleteDoc(postDocRef);
                showMessage("Post and its comments deleted successfully!", 'success');
                // If the deleted post was the one in the detail page, navigate back
                if (currentPostIdForDetail === postId) {
                    hidePostDetailPage(); // Go back to main posts list
                }
            } catch (error) {
                console.error("Error deleting post:", error);
                showMessage("Failed to delete post: " + error.message, 'error');
            } finally {
                hideLoading();
            }
        }

        /**
         * Deletes a specific comment from a post.
         * @param {string} collectionName - The name of the parent collection.
         * @param {string} postId - The ID of the post the comment belongs to.
         * @param {string} commentId - The ID of the comment to delete.
         */
        async function deleteComment(collectionName, postId, commentId) {
            if (currentUserData?.role !== 'admin' && currentUserData?.role !== 'moderator') {
                showMessage("Permission denied. Only administrators or moderators can delete comments.", 'error');
                return;
            }

            const confirmed = await showCustomConfirm("Delete Comment", "Are you sure you want to delete this comment?");
            if (!confirmed) {
                return;
            }

            showLoading();
            try {
                const commentDocRef = doc(db, `artifacts/${appId}/public/data/${collectionName}/${postId}/comments`, commentId);
                await deleteDoc(commentDocRef);
                showMessage("Comment deleted successfully!", 'success');
            } catch (error) {
                console.error("Error deleting comment:", error);
                showMessage("Failed to delete comment: " + error.message, 'error');
            } finally {
                hideLoading();
            }
        }

        /**
         * Toggles the 'onHold' status of a post.
         * @param {string} collectionName - The collection the post belongs to.
         * @param {string} postId - The ID of the post.
         * @param {boolean} currentOnHoldStatus - The current 'onHold' status of the post.
         */
        async function togglePostOnHold(collectionName, postId, currentOnHoldStatus) {
            if (currentUserData?.role !== 'admin' && currentUserData?.role !== 'moderator') {
                showMessage("Permission denied. Only administrators or moderators can put posts on hold.", 'error');
                return;
            }
            showLoading();
            try {
                const postDocRef = doc(db, `artifacts/${appId}/public/data/${collectionName}`, postId);
                await updateDoc(postDocRef, { onHold: !currentOnHoldStatus });
                showMessage(`Post status updated to ${!currentOnHoldStatus ? 'On Hold' : 'Active'}.`, 'success');

                // Re-render the user profile view if currently on it
                if (userProfileViewSection.classList.contains('hidden') === false && userProfileViewSection.dataset.viewedUserId) {
                    showUserProfileView(userProfileViewSection.dataset.viewedUserId, previousView);
                } else {
                    // Otherwise, re-render the main posts list to reflect the change
                    listenForPosts(currentTab, currentSearchQuery, null, 'initial'); // Re-fetch the current page
                }

            } catch (error) {
                console.error("Error toggling post hold status:", error);
                showMessage("Failed to update post hold status: " + error.message, 'error');
            } finally {
                hideLoading();
            }
        }

        /**
         * Toggles the 'onHold' status of a comment.
         * @param {string} collectionName - The collection the parent post belongs to.
         * @param {string} postId - The ID of the parent post.
         * @param {string} commentId - The ID of the comment.
         * @param {boolean} currentOnHoldStatus - The current 'onHold' status of the comment.
         */
        async function toggleCommentOnHold(collectionName, postId, commentId, currentOnHoldStatus) {
            if (currentUserData?.role !== 'admin' && currentUserData?.role !== 'moderator') {
                showMessage("Permission denied. Only administrators or moderators can put comments on hold.", 'error');
                return;
            }
            showLoading();
            try {
                const commentDocRef = doc(db, `artifacts/${appId}/public/data/${collectionName}/${postId}/comments`, commentId);
                await updateDoc(commentDocRef, { onHold: !currentOnHoldStatus });
                showMessage(`Comment status updated to ${!currentOnHoldStatus ? 'On Hold' : 'Active'}.`, 'success');

                // Re-render the comments list for the current post or user profile view
                if (postDetailPage.classList.contains('hidden') === false && currentPostIdForDetail === postId) {
                    listenForComments(collectionName, postId, postDetailCommentsList, false);
                } else if (userProfileViewSection.classList.contains('hidden') === false && userProfileViewSection.dataset.viewedUserId) {
                    showUserProfileView(userProfileViewSection.dataset.viewedUserId, previousView);
                }

            } catch (error) {
                console.error("Error toggling comment hold status:", error);
                showMessage("Failed to update comment hold status: " + error.message, 'error');
            } finally {
                hideLoading();
            }
        }


        /**
         * Renders the posts for the current page.
         * @param {Array} postsToRender - The array of posts to render.
         * @param {HTMLElement} targetElement - The DOM element where posts should be rendered.
         * @param {boolean} showFullContent - Whether to show full content or truncated.
         * @param {boolean} isUserProfileView - Whether this is rendering for a user profile view (affects buttons).
         */
        async function renderPosts(postsToRender, targetElement, showFullContent = false, isUserProfileView = false) {
            targetElement.innerHTML = ''; // Clear existing posts
            if (postsToRender.length === 0) {
                if (targetElement.id === 'viewedUserPostsList') {
                    noUserPostsMessage.classList.remove('hidden');
                } else {
                    targetElement.innerHTML = `<p class="text-center text-gray-400 col-span-full">No posts found for this section${currentSearchQuery ? ` (No results for "${sanitizeHTML(currentSearchQuery)}")` : ''}.</p>`;
                }
                return;
            } else {
                noUserPostsMessage.classList.add('hidden');
            }

            for (const post of postsToRender) {
                let authorProfile = { displayName: 'Anonymous', displayImage: null, verified: false, bio: '' }; // Include bio
                if (post.authorId) {
                    const authorDocRef = doc(db, `artifacts/${appId}/user_profiles`, post.authorId);
                    const authorDocSnap = await getDoc(authorDocRef);
                    if (authorDocSnap.exists()) {
                        authorProfile = authorDocSnap.data();
                    }
                }

                // Pre-calculate avatar URL to simplify template literal
                const postAuthorAvatarUrl = authorProfile.displayImage || getAvatarUrl(authorProfile.displayName, 40);

                let postHtml = '';
                postHtml += `<div class="post-author-info">`;
                postHtml += `<img src="${postAuthorAvatarUrl}" alt="${sanitizeHTML(authorProfile.displayName)}" class="author-avatar" loading="lazy">`;
                postHtml += `<div>`;
                postHtml += `<button class="font-semibold text-sm text-blue-400 hover:underline view-user-profile-btn" data-user-id="${post.authorId}">`;
                postHtml += `${sanitizeHTML(authorProfile.displayName || 'Anonymous')}`;
                postHtml += `${authorProfile.verified ? '<span class="verified-emoji">✅</span>' : ''}`;
                if (post.onHold && (currentUserData?.role === 'admin' || currentUserData?.role === 'moderator')) {
                    postHtml += `<span class="on-hold-badge">On Hold</span>`;
                }
                postHtml += `</button>`;
                postHtml += `<p class="text-xs text-gray-400">${post.timestamp ? new Date(post.timestamp.toDate()).toLocaleString() : 'N/A'}</p>`;
                postHtml += `</div></div>`;
                postHtml += `<h3 class="text-lg font-bold mb-2">${sanitizeHTML(post.title)}</h3>`;
                postHtml += `<p class="text-sm text-gray-300 ${showFullContent ? '' : 'line-clamp-3'}">${sanitizeHTML(post.content)}</p>`;
                if (!showFullContent) {
                    postHtml += `<button class="view-details-btn btn btn-primary text-xs mt-3 w-full" data-post-id="${post.id}">View Details</button>`;
                }
                if (isUserProfileView && (currentUserData?.role === 'admin' || currentUserData?.role === 'moderator')) {
                    postHtml += `
                        <div class="flex flex-wrap gap-2 mt-3">
                            <button class="btn ${post.onHold ? 'btn-primary' : 'btn-secondary'} text-xs toggle-post-hold-btn" data-post-id="${post.id}" data-collection-name="${post.collectionName}" data-on-hold="${post.onHold}">
                                ${post.onHold ? 'Activate Post' : 'Put On Hold'}
                            </button>
                            <button class="btn btn-danger text-xs delete-post-from-profile-btn" data-post-id="${post.id}" data-collection-name="${post.collectionName}">
                                Delete Post
                            </button>
                        </div>
                    `;
                }

                const postElement = document.createElement('div');
                postElement.className = `post-item ${post.onHold && (currentUserData?.role === 'admin' || currentUserData?.role === 'moderator') ? 'on-hold-item' : ''}`;
                postElement.dataset.postId = post.id; // Store post ID for click handling
                postElement.dataset.collectionName = post.collectionName || currentTab; // Store collection name
                postElement.innerHTML = postHtml;
                targetElement.appendChild(postElement);

                // Attach event listener for viewing post details
                if (!showFullContent) {
                    postElement.querySelector('.view-details-btn').addEventListener('click', () => {
                        showPostDetailPage(post);
                    });
                }

                // Attach event listener for viewing user profile
                postElement.querySelector('.view-user-profile-btn').addEventListener('click', (event) => {
                    const userId = event.target.dataset.userId;
                    showUserProfileView(userId); // Now any user can view
                });

                // Attach event listeners for admin actions in user profile view
                if (isUserProfileView && (currentUserData?.role === 'admin' || currentUserData?.role === 'moderator')) {
                    const toggleHoldBtn = postElement.querySelector('.toggle-post-hold-btn');
                    if (toggleHoldBtn) {
                        toggleHoldBtn.addEventListener('click', async () => {
                            const postId = toggleHoldBtn.dataset.postId;
                            const collectionName = toggleHoldBtn.dataset.collectionName;
                            const currentOnHold = toggleHoldBtn.dataset.onHold === 'true';
                            await togglePostOnHold(collectionName, postId, currentOnHold);
                        });
                    }
                    const deleteBtn = postElement.querySelector('.delete-post-from-profile-btn');
                    if (deleteBtn) {
                        deleteBtn.addEventListener('click', async () => {
                            await deletePost(deleteBtn.dataset.collectionName, deleteBtn.dataset.postId);
                        });
                    }
                }
            }
        }

        /**
         * Renders the pagination controls (Previous/Next buttons and page info).
         * @param {number} fetchedCount - The number of posts fetched in the current query.
         */
        function renderPaginationControls(fetchedCount) {
            pageInfo.textContent = `Page ${currentPage}`; // No total pages without fetching all

            prevPageBtn.disabled = currentPage === 1;
            // next button is disabled if we fetched less than postsPerPage, meaning it's the last page
            nextPageBtn.disabled = fetchedCount < postsPerPage;

            if (fetchedCount > 0 || currentPage > 1) { // Show controls if there are posts or if we're not on page 1
                paginationControls.classList.remove('hidden');
            } else {
                paginationControls.classList.add('hidden');
            }
        }

        // Event listeners for pagination buttons
        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                listenForPosts(currentTab, currentSearchQuery, null, 'prev');
            }
        });

        nextPageBtn.addEventListener('click', () => {
            currentPage++;
            listenForPosts(currentTab, currentSearchQuery, null, 'next');
        }
        );


        /**
         * Listens for real-time updates to posts in a given collection with pagination and filtering.
         * @param {string} collectionName - The name of the Firestore collection (e.g., 'snippets').
         * @param {string} searchQuery - Optional search query to filter posts.
         * @param {string|null} authorIdFilter - Optional author ID to filter posts by.
         * @param {string} direction - 'initial', 'next', or 'prev'.
         */
        function listenForPosts(collectionName, searchQuery = '', authorIdFilter = null, direction = 'initial') {
            if (unsubscribeFromPosts) {
                unsubscribeFromPosts();
            }

            if (!isAuthReady || !currentUserId) {
                console.warn("Auth not ready or user not logged in. Cannot listen for posts.");
                postsSection.innerHTML = '<p class="text-center text-gray-400 col-span-full">Please log in to view posts.</p>';
                paginationControls.classList.add('hidden'); // Hide pagination if not logged in
                return;
            }

            const postsRef = collection(db, `artifacts/${appId}/public/data/${collectionName}`);
            let q;

            // Base query always orders by timestamp descending
            let baseQuery = query(postsRef, orderBy('timestamp', 'desc'));

            if (direction === 'next' && lastVisibleDoc) {
                q = query(baseQuery, startAfter(lastVisibleDoc), limit(postsPerPage));
            } else if (direction === 'prev' && firstVisibleDoc) {
                q = query(baseQuery, endBefore(firstVisibleDoc), limit(postsPerPage));
            } else { // 'initial' load or no startDoc
                q = query(baseQuery, limit(postsPerPage));
            }


            unsubscribeFromPosts = onSnapshot(q, async (snapshot) => {
                let posts = [];
                snapshot.forEach(doc => {
                    posts.push({ id: doc.id, collectionName: collectionName, ...doc.data() });
                });

                // Update cursors for next/prev navigation
                firstVisibleDoc = snapshot.docs[0] || null;
                lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1] || null;

                // Apply client-side filters (search query, author ID, onHold status)
                let filteredPosts = posts;
                if (searchQuery) {
                    const lowerCaseSearchSearchQuery = searchQuery.toLowerCase();
                    filteredPosts = filteredPosts.filter(post =>
                        (post.title && post.title.toLowerCase().includes(lowerCaseSearchSearchQuery)) ||
                        (post.content && post.content.toLowerCase().includes(lowerCaseSearchSearchQuery))
                    );
                }

                if (authorIdFilter) {
                    filteredPosts = filteredPosts.filter(post => post.authorId === authorIdFilter);
                }

                if (currentUserData?.role !== 'admin' && currentUserData?.role !== 'moderator') {
                    filteredPosts = filteredPosts.filter(post => !post.onHold);
                }

                // Store only the currently displayed posts for detail page lookup
                allFetchedPosts = filteredPosts;

                // Render the filtered posts
                await renderPosts(filteredPosts, postsSection, false, false);
                renderPaginationControls(snapshot.docs.length); // Pass actual fetched count to determine next/prev button state
            }, (error) => {
                console.error("Error fetching posts:", error);
                showMessage("Failed to load posts. " + error.message, 'error');
                postsSection.innerHTML = '<p class="text-center text-red-400 col-span-full">Error loading posts.</p>';
                paginationControls.classList.add('hidden');
            });
        }

        /**
         * Shows the post detail page with the given post data.
         * @param {object} post - The post object containing all details.
         */
        async function showPostDetailPage(post) {
            hideAllSections(); // Hide all other sections
            postDetailPage.classList.remove('hidden'); // Show the detail page

            currentPostIdForDetail = post.id; // Store the ID of the post being viewed
            previousView = 'posts'; // Set previous view for back button

            postDetailTitle.textContent = sanitizeHTML(post.title);
            postDetailAuthorAvatar.src = post.authorDisplayImage || getAvatarUrl(post.authorDisplayName, 40);
            postDetailAuthorDisplayName.textContent = sanitizeHTML(post.authorDisplayName || 'Anonymous');
            postDetailAuthorId.textContent = truncateUserId(post.authorId);
            postDetailTimestamp.textContent = post.timestamp ? new Date(post.timestamp.toDate()).toLocaleString() : 'N/A';
            postDetailContent.textContent = post.content; // textContent is safer for pre tags

            // Make author's name clickable in detail page
            postDetailAuthorDisplayName.onclick = () => {
                showUserProfileView(post.authorId, 'postDetail'); // Now any user can view
            };
            postDetailAuthorDisplayName.classList.add('text-blue-400', 'hover:underline', 'cursor-pointer');


            // Fetch author's verified status for the detail page
            let authorProfileForDetail = { verified: false };
            if (post.authorId) {
                const authorDocRef = doc(db, `artifacts/${appId}/user_profiles`, post.authorId);
                const authorDocSnap = await getDoc(authorDocRef);
                if (authorDocSnap.exists()) {
                    authorProfileForDetail = authorDocSnap.data();
                }
            }
            if (authorProfileForDetail.verified) {
                postDetailVerifiedBadge.classList.remove('hidden');
            } else {
                postDetailVerifiedBadge.classList.add('hidden');
            }

            // Handle image and video
            if (post.postImage) {
                postDetailImage.src = post.postImage;
                postDetailImageSection.classList.remove('hidden');
            } else {
                postDetailImageSection.classList.add('hidden');
                postDetailImage.src = ''; // Clear src
            }

            if (post.postVideo) {
                const youtubeId = getYouTubeVideoId(post.postVideo);
                if (youtubeId) {
                    postDetailVideo.src = `https://www.youtube.com/embed/${youtubeId}`;
                    postDetailVideoSection.classList.remove('hidden');
                } else {
                    postDetailVideoSection.classList.add('hidden');
                    postDetailVideo.src = ''; // Clear src
                }
            } else {
                postDetailVideoSection.classList.add('hidden');
                postDetailVideo.src = ''; // Clear src
            }

            // Set up comments for this specific post in the page
            postDetailCommentsList._unsubscribeComments && postDetailCommentsList._unsubscribeComments(); // Unsubscribe old listener if any
            listenForComments(currentTab, post.id); // Listen for comments specific to this post

            // Attach event listener for adding comments in the detail page
            addDetailCommentBtn.onclick = async () => { // Use onclick to easily replace the handler
                const commentContent = postDetailCommentContent.value.trim();
                if (commentContent) {
                    addDetailCommentBtn.disabled = true;
                    showLoading();
                    try {
                        await addComment(currentTab, post.id, commentContent);
                        postDetailCommentContent.value = ''; // Clear input after adding
                    } finally {
                        hideLoading();
                        addDetailCommentBtn.disabled = false;
                    }
                } else {
                    showMessage("Comment cannot be empty.", 'error');
                }
            };

            // Show/hide edit/delete/ban/kick buttons based on user role and post ownership
            const canEditPost = currentUserData && (
                currentUserData.role === 'admin' ||
                currentUserData.role === 'moderator' ||
                (currentUserData.role === 'user' && post.authorId === currentUserId)
            );
            const canDeletePost = currentUserData && (currentUserData.role === 'admin' || currentUserData.role === 'moderator');
            const canBanUser = currentUserData?.role === 'admin' && post.authorId !== currentUserId;
            const canKickUser = (currentUserData?.role === 'admin' || currentUserData?.role === 'moderator') && post.authorId !== currentUserId;


            if (canEditPost) {
                editPostFromDetailBtn.classList.remove('hidden');
                editPostFromDetailBtn.onclick = () => openEditPostModal(
                    post.id, currentTab, post.title, post.content, post.postImage || '', post.postVideo || ''
                );
            } else {
                editPostFromDetailBtn.classList.add('hidden');
            }

            if (canDeletePost) {
                deletePostFromDetailBtn.classList.remove('hidden');
                deletePostFromDetailBtn.onclick = async () => {
                    deletePostFromDetailBtn.disabled = true;
                    await deletePost(currentTab, post.id);
                    deletePostFromDetailBtn.disabled = false;
                };
            } else {
                deletePostFromDetailBtn.classList.add('hidden');
            }

            if (canBanUser) {
                banUserFromDetailBtn.classList.remove('hidden');
                banUserFromDetailBtn.onclick = async () => {
                    banUserFromDetailBtn.disabled = true;
                    await updateUserStatus(post.authorId, 'banned', true);
                    banUserFromDetailBtn.disabled = false;
                };
            } else {
                banUserFromDetailBtn.classList.add('hidden');
            }

            if (canKickUser) {
                kickUserFromDetailBtn.classList.remove('hidden');
                kickUserFromDetailBtn.onclick = async () => {
                    kickUserFromDetailBtn.disabled = true;
                    await kickUser(post.authorId);
                    kickUserFromDetailBtn.disabled = false;
                };
            } else {
                kickUserFromDetailBtn.classList.add('hidden');
            }
        }

        /**
         * Hides the post detail page and returns to the main posts list.
         */
        function hidePostDetailPage() {
            postDetailPage.classList.add('hidden');
            postsSection.classList.remove('hidden');
            searchSection.classList.remove('hidden');
            addPostSection.classList.remove('hidden');
            paginationControls.classList.remove('hidden');
            currentPostIdForDetail = null; // Clear the current post ID
            // Re-render the main posts list to ensure correct state
            currentPage = 1; // Reset to first page when returning from detail
            lastVisibleDoc = null;
            firstVisibleDoc = null;
            listenForPosts(currentTab, currentSearchQuery, null, 'initial');
        }

        // Event listener for the "Back to All Posts" button
        backToPostsBtn.addEventListener('click', hidePostDetailPage);


        /**
         * Handles copying the code from the post detail page.
         */
        copyCodeBtn.addEventListener('click', () => {
            const codeToCopy = postDetailContent.textContent;
            if (codeToCopy) {
                const textarea = document.createElement('textarea');
                textarea.value = codeToCopy;
                document.body.appendChild(textarea);
                textarea.select();
                try {
                    document.execCommand('copy');
                    showMessage("Code copied to clipboard!", 'success');
                } catch (err) {
                    console.error('Failed to copy text: ', err);
                    showMessage("Failed to copy code.", 'error');
                }
                document.body.removeChild(textarea);
            } else {
                showMessage("No code to copy.", 'error');
            }
        });


        /**
         * Listens for real-time updates to comments for a specific post.
         * @param {string} collectionName - The name of the parent collection.
         * @param {string} postId - The ID of the post.
         * @param {HTMLElement} targetElement - The element to render comments into (e.g., postDetailCommentsList or viewedUserCommentsList).
         * @param {boolean} isUserProfileView - True if rendering for user profile view.
         */
        function listenForComments(collectionName, postId, targetElement = postDetailCommentsList, isUserProfileView = false) {
            if (!targetElement) return;

            // Store unsubscribe function on the element itself to manage multiple listeners
            if (targetElement._unsubscribeComments) {
                targetElement._unsubscribeComments();
            }

            const commentsRef = collection(db, `artifacts/${appId}/public/data/${collectionName}/${postId}/comments`);
            const q = query(commentsRef, orderBy('timestamp', 'asc')); // Comments always ordered by timestamp ascending

            targetElement._unsubscribeComments = onSnapshot(q, async (snapshot) => {
                targetElement.innerHTML = '';
                let comments = [];
                snapshot.forEach(doc => {
                    comments.push({ id: doc.id, ...doc.data() });
                });

                // Filter out on-hold comments for non-admins/moderators
                if (!isUserProfileView && currentUserData?.role !== 'admin' && currentUserData?.role !== 'moderator') {
                    comments = comments.filter(comment => !comment.onHold);
                }

                if (comments.length === 0) {
                    if (targetElement.id === 'viewedUserCommentsList') {
                        noUserCommentsMessage.classList.remove('hidden');
                    } else {
                        targetElement.innerHTML = '<p class="text-sm text-gray-400">No comments yet. Be the first!</p>';
                    }
                } else {
                    noUserCommentsMessage.classList.add('hidden');
                    for (const comment of comments) {
                        let authorProfile = { displayName: 'Anonymous', displayImage: null, verified: false, bio: '' }; // Include bio
                        if (comment.authorId) {
                            const authorDocRef = doc(db, `artifacts/${appId}/user_profiles`, comment.authorId);
                            const authorDocSnap = await getDoc(authorDocRef);
                            if (authorDocSnap.exists()) {
                                authorProfile = authorDocSnap.data();
                            }
                        }

                        const commentElement = document.createElement('div');
                        commentElement.className = `comment-item ${comment.onHold && (currentUserData?.role === 'admin' || currentUserData?.role === 'moderator') ? 'on-hold-item' : ''}`;
                        commentElement.innerHTML = `
                            <div class="comment-author-info">
                                <img src="${authorProfile.displayImage || getAvatarUrl(authorProfile.displayName, 36)}" alt="${sanitizeHTML(authorProfile.displayName)}" class="comment-avatar" loading="lazy">
                                <div>
                                    <button class="font-semibold text-sm text-blue-400 hover:underline view-user-profile-btn" data-user-id="${comment.authorId}">
                                        ${sanitizeHTML(authorProfile.displayName || 'Anonymous')}
                                        ${authorProfile.verified ? '<span class="verified-emoji">✅</span>' : ''}
                                    </button>
                                    ${comment.onHold && (currentUserData?.role === 'admin' || currentUserData?.role === 'moderator') ? '<span class="on-hold-badge">On Hold</span>' : ''}
                                    <p class="text-xs text-gray-400">ID: ${truncateUserId(comment.authorId)}</p>
                                    <p class="text-xs text-gray-500">${comment.timestamp ? new Date(comment.timestamp.toDate()).toLocaleString() : 'N/A'}</p>
                                </div>
                            </div>
                            <p class="text-sm">${sanitizeHTML(comment.content)}</p>
                            ${(currentUserData?.role === 'admin' || currentUserData?.role === 'moderator') ? `
                                <div class="flex flex-wrap gap-2 mt-2">
                                    <button class="btn ${comment.onHold ? 'btn-primary' : 'btn-secondary'} text-xs toggle-comment-hold-btn" data-post-id="${postId}" data-comment-id="${comment.id}" data-collection-name="${collectionName}" data-on-hold="${comment.onHold}">
                                        ${comment.onHold ? 'Activate Comment' : 'Put On Hold'}
                                    </button>
                                    <button class="btn btn-danger text-xs delete-comment-btn" data-post-id="${postId}" data-comment-id="${comment.id}" data-collection-name="${collectionName}">
                                        Delete Comment
                                    </button>
                                </div>
                            ` : ''}
                            ${(currentUserData?.role === 'admin' || currentUserData?.role === 'moderator') && comment.authorId !== currentUserId && !isUserProfileView ?
                                `<button class="kick-user-btn btn btn-danger text-xs mt-2 ml-2" data-user-id="${comment.authorId}">Kick User</button>` : ''
                            }
                            ${currentUserData?.role === 'admin' && comment.authorId !== currentUserId && !isUserProfileView ?
                                `<button class="ban-user-btn btn btn-danger text-xs mt-2 ml-2" data-user-id="${comment.authorId}">Admin Ban User</button>` : ''
                            }
                        `;
                        targetElement.appendChild(commentElement);

                        // Attach event listener for deleting comments
                        const deleteCommentButton = commentElement.querySelector(`.delete-comment-btn[data-comment-id="${comment.id}"]`);
                        if (deleteCommentButton) {
                            deleteCommentButton.addEventListener('click', async () => {
                                await deleteComment(deleteCommentButton.dataset.collectionName, deleteCommentButton.dataset.postId, deleteCommentButton.dataset.commentId);
                            });
                        }

                        // Attach event listener for banning user (if admin)
                        const banButton = commentElement.querySelector(`.ban-user-btn[data-user-id="${comment.authorId}"]`);
                        if (banButton) {
                            banButton.addEventListener('click', async (event) => {
                                banButton.disabled = true;
                                const userIdToBan = event.target.dataset.userId;
                                await updateUserStatus(userIdToBan, 'banned', true);
                                banButton.disabled = false;
                            });
                        }

                        // Attach event listener for kicking user
                        const kickButton = commentElement.querySelector(`.kick-user-btn[data-user-id="${comment.authorId}"]`);
                        if (kickButton) {
                            kickButton.addEventListener('click', async (event) => {
                                kickButton.disabled = true;
                                const userIdToKick = event.target.dataset.userId;
                                await kickUser(userIdToKick);
                                kickButton.disabled = false;
                            });
                        }

                        // Attach event listener for viewing user profile from comments
                        const viewProfileButton = commentElement.querySelector(`.view-user-profile-btn[data-user-id="${comment.authorId}"]`);
                        if (viewProfileButton) {
                            viewProfileButton.addEventListener('click', (event) => {
                                const userId = event.target.dataset.userId;
                                showUserProfileView(userId, 'postDetail'); // Now any user can view
                            });
                        }

                        // Attach event listener for toggling comment hold status
                        const toggleHoldBtn = commentElement.querySelector('.toggle-comment-hold-btn');
                        if (toggleHoldBtn) {
                            toggleHoldBtn.addEventListener('click', async () => {
                                toggleHoldBtn.disabled = true;
                                const postId = toggleHoldBtn.dataset.postId;
                                const commentId = toggleHoldBtn.dataset.commentId;
                                const collection = toggleHoldBtn.dataset.collectionName;
                                const currentOnHold = toggleHoldBtn.dataset.onHold === 'true';
                                await toggleCommentOnHold(collection, postId, commentId, currentOnHold);
                                toggleHoldBtn.disabled = false;
                            });
                        }
                    }
                }
            }, (error) => {
                console.error("Error fetching comments:", error);
                showMessage("Failed to load comments. " + error.message, 'error');
            });
        }

        /**
         * Adds a new post to the currently active collection.
         */
        addPostBtn.addEventListener('click', async () => {
            const title = postTitleInput.value.trim();
            const content = postContentInput.value.trim();
            const postImageUrl = postImageUrlInput.value.trim();
            const postVideoUrl = postVideoUrlInput.value.trim();

            if (!currentUserId) {
                showMessage("You must be logged in to add a post.", 'error');
                return;
            }
            if (currentUserData?.banned) {
                showMessage("You are banned and cannot add posts.", 'error');
                return;
            }
            if (!title || !content) {
                showMessage("Please fill in both title and content.", 'error');
                return;
            }
            if (containsBadWords(title) || containsBadWords(content)) {
                showMessage("Your post contains inappropriate language. Please review and try again.", 'error');
                return;
            }

            let finalPostImage = null;
            if (currentUserData?.role === 'admin' || currentUserData?.role === 'moderator') {
                if (postImageUrl) {
                    finalPostImage = postImageUrl;
                }
            }

            addPostBtn.disabled = true;
            showLoading();
            try {
                const postsCollectionRef = collection(db, `artifacts/${appId}/public/data/${currentTab}`);
                await addDoc(postsCollectionRef, {
                    title: title,
                    content: content,
                    authorId: currentUserId,
                    authorDisplayName: currentUserData?.displayName || 'Anonymous',
                    authorDisplayImage: currentUserData?.displayImage || null,
                    postImage: finalPostImage,
                    postVideo: postVideoUrl,
                    timestamp: new Date(),
                    onHold: false // New field: default to not on hold
                });
                showMessage("Post added successfully!", 'success');
                postTitleInput.value = '';
                postContentInput.value = '';
                postImageUrlInput.value = '';
                postVideoUrlInput.value = '';
                currentPage = 1; // Reset to first page to see the new post
                lastVisibleDoc = null;
                firstVisibleDoc = null;
                listenForPosts(currentTab, currentSearchQuery, null, 'initial');
            } catch (error) {
                console.error("Error adding post:", error);
                showMessage("Failed to add post: " + error.message, 'error');
            } finally {
                hideLoading();
                addPostBtn.disabled = false;
            }
        });

        /**
         * Adds a new comment to a specific post.
         * @param {string} collectionName - The name of the parent collection.
         * @param {string} postId - The ID of the post to comment on.
         * @param {string} commentContent - The content of the comment.
         */
        async function addComment(collectionName, postId, commentContent) {
            if (!currentUserId) {
                showMessage("You must be logged in to add a comment.", 'error');
                return;
            }
            if (currentUserData?.banned) {
                showMessage("You are banned and cannot add comments.", 'error');
                return;
            }
            if (!commentContent) {
                showMessage("Comment cannot be empty.", 'error');
                return;
            }
            if (containsBadWords(commentContent)) {
                showMessage("Your comment contains inappropriate language. Please review and try again.", 'error');
                return;
            }

            showLoading(); // Loading spinner already shown by calling function
            try {
                const commentsCollectionRef = collection(db, `artifacts/${appId}/public/data/${collectionName}/${postId}/comments`);
                await addDoc(commentsCollectionRef, {
                    content: commentContent,
                    authorId: currentUserId,
                    authorDisplayName: currentUserData?.displayName || 'Anonymous',
                    authorDisplayImage: currentUserData?.displayImage || null,
                    timestamp: new Date(),
                    onHold: false // New field: default to not on hold
                });
                showMessage("Comment added successfully!", 'success');
            } catch (error) {
                console.error("Error adding comment:", error);
                showMessage("Failed to add comment: " + error.message, 'error');
            } finally {
                // hideLoading() and button.disabled = false; handled by calling function
            }
        }


        tabSnippets.addEventListener('click', () => switchTab('snippets'));
        tabBugFixes.addEventListener('click', () => switchTab('bugFixes'));
        tabAskForHelp.addEventListener('click', () => switchTab('askForHelp'));
        tabUserManagement.addEventListener('click', () => switchTab('userManagement'));
        tabMyProfile.addEventListener('click', () => switchTab('myProfile'));

        // --- Search Bar Functionality ---
        const debouncedSearch = debounce(() => {
            currentSearchQuery = searchBar.value.trim();
            currentPage = 1; // Reset to first page on new search
            lastVisibleDoc = null; // Reset pagination cursors
            firstVisibleDoc = null;
            listenForPosts(currentTab, currentSearchQuery, null, 'initial');
        }, 300); // Debounce by 300ms

        searchBar.addEventListener('input', debouncedSearch);

        // --- Friend Request Functions ---

        /**
         * Sends a friend request to a target user.
         * @param {string} targetUserId - The ID of the user to send a request to.
         */
        async function sendFriendRequest(targetUserId) {
            if (!currentUserId || currentUserData?.banned) {
                showMessage("You must be logged in and not banned to send friend requests.", 'error');
                return;
            }
            if (targetUserId === currentUserId) {
                showMessage("You cannot send a friend request to yourself.", 'error');
                return;
            }
            if (currentUserData.friends.includes(targetUserId)) {
                showMessage("You are already friends with this user.", 'info');
                return;
            }
            if (currentUserData.sentRequests.includes(targetUserId)) {
                showMessage("You have already sent a friend request to this user.", 'info');
                return;
            }
            if (currentUserData.receivedRequests.includes(targetUserId)) {
                showMessage("This user has already sent you a friend request. Please accept it.", 'info');
                return;
            }

            showLoading();
            try {
                // Add to current user's sentRequests
                const currentUserRef = doc(db, `artifacts/${appId}/user_profiles`, currentUserId);
                await updateDoc(currentUserRef, {
                    sentRequests: arrayUnion(targetUserId)
                });

                // Add to target user's receivedRequests
                const targetUserRef = doc(db, `artifacts/${appId}/user_profiles`, targetUserId);
                await updateDoc(targetUserRef, {
                    receivedRequests: arrayUnion(currentUserId)
                });

                showMessage("Friend request sent!", 'success');
                // Re-fetch user data to update UI instantly
                await fetchUserData(currentUserId);
                showUserProfileView(targetUserId, previousView); // Refresh viewed profile
            } catch (error) {
                console.error("Error sending friend request:", error);
                showMessage("Failed to send friend request: " + error.message, 'error');
            } finally {
                hideLoading();
            }
        }

        /**
         * Accepts a friend request from a sender.
         * @param {string} senderId - The ID of the user who sent the request.
         */
        async function acceptFriendRequest(senderId) {
            if (!currentUserId || currentUserData?.banned) {
                showMessage("You must be logged in and not banned to accept friend requests.", 'error');
                return;
            }

            showLoading();
            try {
                // Remove from current user's receivedRequests and add to friends
                const currentUserRef = doc(db, `artifacts/${appId}/user_profiles`, currentUserId);
                await updateDoc(currentUserRef, {
                    receivedRequests: arrayRemove(senderId),
                    friends: arrayUnion(senderId)
                });

                // Remove from sender's sentRequests and add to friends
                const senderUserRef = doc(db, `artifacts/${appId}/user_profiles`, senderId);
                await updateDoc(senderUserRef, {
                    sentRequests: arrayRemove(currentUserId),
                    friends: arrayUnion(currentUserId)
                });

                showMessage("Friend request accepted!", 'success');
                // Re-fetch user data to update UI instantly
                await fetchUserData(currentUserId);
                if (myProfileSection.classList.contains('hidden') === false) {
                    renderFriendLists(); // Refresh my profile if on it
                } else if (userProfileViewSection.dataset.viewedUserId === senderId) {
                    showUserProfileView(senderId, previousView); // Refresh viewed profile if it's the sender
                }
            } catch (error) {
                console.error("Error accepting friend request:", error);
                showMessage("Failed to accept friend request: " + error.message, 'error');
            } finally {
                hideLoading();
            }
        }

        /**
         * Declines a friend request from a sender.
         * @param {string} senderId - The ID of the user who sent the request.
         */
        async function declineFriendRequest(senderId) {
            if (!currentUserId || currentUserData?.banned) {
                showMessage("You must be logged in and not banned to decline friend requests.", 'error');
                return;
            }

            showLoading();
            try {
                // Remove from current user's receivedRequests
                const currentUserRef = doc(db, `artifacts/${appId}/user_profiles`, currentUserId);
                await updateDoc(currentUserRef, {
                    receivedRequests: arrayRemove(senderId)
                });

                // Remove from sender's sentRequests
                const senderUserRef = doc(db, `artifacts/${appId}/user_profiles`, senderId);
                await updateDoc(senderUserRef, {
                    sentRequests: arrayRemove(currentUserId)
                });

                showMessage("Friend request declined.", 'info');
                // Re-fetch user data to update UI instantly
                await fetchUserData(currentUserId);
                if (myProfileSection.classList.contains('hidden') === false) {
                    renderFriendLists(); // Refresh my profile if on it
                } else if (userProfileViewSection.dataset.viewedUserId === senderId) {
                    showUserProfileView(senderId, previousView); // Refresh viewed profile if it's the sender
                }
            } catch (error) {
                console.error("Error declining friend request:", error);
                showMessage("Failed to decline friend request: " + error.message, 'error');
            } finally {
                hideLoading();
            }
        }

        /**
         * Removes a friend.
         * @param {string} friendId - The ID of the friend to remove.
         */
        async function removeFriend(friendId) {
            if (!currentUserId || currentUserData?.banned) {
                showMessage("You must be logged in and not banned to remove friends.", 'error');
                return;
            }
            const confirmed = await showCustomConfirm("Remove Friend", "Are you sure you want to remove this friend?");
            if (!confirmed) {
                return;
            }

            showLoading();
            try {
                // Remove from current user's friends list
                const currentUserRef = doc(db, `artifacts/${appId}/user_profiles`, currentUserId);
                await updateDoc(currentUserRef, {
                    friends: arrayRemove(friendId)
                });

                // Remove current user from friend's friends list
                const friendUserRef = doc(db, `artifacts/${appId}/user_profiles`, friendId);
                await updateDoc(friendUserRef, {
                    friends: arrayRemove(currentUserId)
                });

                showMessage("Friend removed.", 'info');
                // Re-fetch user data to update UI instantly
                await fetchUserData(currentUserId);
                if (myProfileSection.classList.contains('hidden') === false) {
                    renderFriendLists(); // Refresh my profile if on it
                } else if (userProfileViewSection.dataset.viewedUserId === friendId) {
                    showUserProfileView(friendId, previousView); // Refresh viewed profile if it's the removed friend
                }
            } catch (error) {
                console.error("Error removing friend:", error);
                showMessage("Failed to remove friend: " + error.message, 'error');
            } finally {
                hideLoading();
            }
        }

        /**
         * Renders the friend, sent, and received request lists on the "My Profile" page.
         */
        async function renderFriendLists() {
            if (!currentUserData) return;

            // Render Received Requests
            receivedRequestsList.innerHTML = '';
            if (currentUserData.receivedRequests && currentUserData.receivedRequests.length > 0) {
                for (const userId of currentUserData.receivedRequests) {
                    const userDoc = await getDoc(doc(db, `artifacts/${appId}/user_profiles`, userId));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        const requestItem = document.createElement('div');
                        requestItem.className = 'request-list-item';
                        requestItem.innerHTML = `
                            <img src="${userData.displayImage || getAvatarUrl(userData.displayName, 32)}" alt="${sanitizeHTML(userData.displayName)}" class="author-avatar" loading="lazy">
                            <span class="font-semibold mr-2">${sanitizeHTML(userData.displayName)}</span>
                            <button class="btn btn-primary text-xs mr-2 accept-request-btn" data-user-id="${userId}">Accept</button>
                            <button class="btn btn-secondary text-xs decline-request-btn" data-user-id="${userId}">Decline</button>
                        `;
                        receivedRequestsList.appendChild(requestItem);
                    }
                }
                receivedRequestsList.querySelectorAll('.accept-request-btn').forEach(btn => {
                    btn.addEventListener('click', () => acceptFriendRequest(btn.dataset.userId));
                });
                receivedRequestsList.querySelectorAll('.decline-request-btn').forEach(btn => {
                    btn.addEventListener('click', () => declineFriendRequest(btn.dataset.userId));
                });
            } else {
                receivedRequestsList.innerHTML = '<p class="text-gray-400">No pending friend requests.</p>';
            }

            // Render My Friends
            myFriendsList.innerHTML = '';
            if (currentUserData.friends && currentUserData.friends.length > 0) {
                for (const userId of currentUserData.friends) {
                    const userDoc = await getDoc(doc(db, `artifacts/${appId}/user_profiles`, userId));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        const friendItem = document.createElement('div');
                        friendItem.className = 'friend-list-item';
                        friendItem.innerHTML = `
                            <img src="${userData.displayImage || getAvatarUrl(userData.displayName, 32)}" alt="${sanitizeHTML(userData.displayName)}" class="author-avatar" loading="lazy">
                            <button class="font-semibold mr-2 text-blue-400 hover:underline view-user-profile-btn" data-user-id="${userId}">${sanitizeHTML(userData.displayName)}</button>
                            <button class="btn btn-danger text-xs ml-auto remove-friend-btn" data-user-id="${userId}">Remove</button>
                        `;
                        myFriendsList.appendChild(friendItem);
                    }
                }
                myFriendsList.querySelectorAll('.remove-friend-btn').forEach(btn => {
                    btn.addEventListener('click', () => removeFriend(btn.dataset.userId));
                });
                myFriendsList.querySelectorAll('.view-user-profile-btn').forEach(btn => {
                    btn.addEventListener('click', () => showUserProfileView(btn.dataset.userId, 'myProfile'));
                });
            } else {
                myFriendsList.innerHTML = '<p class="text-gray-400">You have no friends yet.</p>';
            }

            // Render Sent Requests
            sentRequestsList.innerHTML = '';
            if (currentUserData.sentRequests && currentUserData.sentRequests.length > 0) {
                for (const userId of currentUserData.sentRequests) {
                    const userDoc = await getDoc(doc(db, `artifacts/${appId}/user_profiles`, userId));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        const sentRequestItem = document.createElement('div');
                        sentRequestItem.className = 'request-list-item';
                        sentRequestItem.innerHTML = `
                            <img src="${userData.displayImage || getAvatarUrl(userData.displayName, 32)}" alt="${sanitizeHTML(userData.displayName)}" class="author-avatar" loading="lazy">
                            <span class="font-semibold mr-2">${sanitizeHTML(userData.displayName)}</span>
                            <span class="text-gray-500 text-xs ml-auto">Request Sent</span>
                        `;
                        sentRequestsList.appendChild(sentRequestItem);
                    }
                }
            } else {
                sentRequestsList.innerHTML = '<p class="text-gray-400">You haven\'t sent any friend requests.</p>';
            }
        }


        // --- User Profile View Functionality (New) ---

        /**
         * Shows the user profile view for a specific user.
         * @param {string} userId - The ID of the user to view.
         * @param {string} origin - The view from which the user profile view was opened ('posts' or 'postDetail' or 'myProfile').
         */
        async function showUserProfileView(userId, origin = 'posts') {
            if (!currentUserId) {
                showMessage("You must be logged in to view user profiles.", 'error');
                return;
            }

            hideAllSections();
            userProfileViewSection.classList.remove('hidden');
            userProfileViewSection.dataset.viewedUserId = userId; // Store the ID of the user being viewed
            previousView = origin; // Store the origin for back navigation

            showLoading();
            try {
                const userDocRef = doc(db, `artifacts/${appId}/user_profiles`, userId);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    viewedUserDisplayName.textContent = sanitizeHTML(userData.displayName || 'N/A');
                    viewedUserEmail.textContent = sanitizeHTML(userData.email || 'N/A');
                    viewedUserRole.textContent = `Role: ${sanitizeHTML(userData.role || 'user')}`;
                    viewedUserVerified.textContent = `Verified: ${userData.verified ? 'Yes' : 'No'}`;
                    viewedUserId.textContent = userId;
                    viewedUserBio.textContent = userData.bio ? `Bio: ${sanitizeHTML(userData.bio)}` : 'Bio: Not set';
                    viewedUserAvatar.src = userData.displayImage || getAvatarUrl(userData.displayName, 100);

                    // Render Friend Action Button
                    friendActionButtonContainer.innerHTML = '';
                    if (userId === currentUserId) {
                        // Current user viewing their own profile - no friend button needed
                    } else if (currentUserData.friends.includes(userId)) {
                        const removeFriendBtn = document.createElement('button');
                        removeFriendBtn.className = 'btn btn-danger text-sm';
                        removeFriendBtn.textContent = 'Remove Friend';
                        removeFriendBtn.addEventListener('click', () => removeFriend(userId));
                        friendActionButtonContainer.appendChild(removeFriendBtn);
                    } else if (currentUserData.sentRequests.includes(userId)) {
                        const requestSentBtn = document.createElement('button');
                        requestSentBtn.className = 'btn btn-secondary text-sm';
                        requestSentBtn.textContent = 'Request Sent';
                        requestSentBtn.disabled = true;
                        friendActionButtonContainer.appendChild(requestSentBtn);
                    } else if (currentUserData.receivedRequests.includes(userId)) {
                        const acceptBtn = document.createElement('button');
                        acceptBtn.className = 'btn btn-primary text-sm mr-2';
                        acceptBtn.textContent = 'Accept Request';
                        acceptBtn.addEventListener('click', () => acceptFriendRequest(userId));
                        friendActionButtonContainer.appendChild(acceptBtn);

                        const declineBtn = document.createElement('button');
                        declineBtn.className = 'btn btn-secondary text-sm';
                        declineBtn.textContent = 'Decline Request';
                        declineBtn.addEventListener('click', () => declineFriendRequest(userId));
                        friendActionButtonContainer.appendChild(declineBtn);
                    } else {
                        const sendRequestBtn = document.createElement('button');
                        sendRequestBtn.className = 'btn btn-primary text-sm';
                        sendRequestBtn.textContent = 'Send Friend Request';
                        sendRequestBtn.addEventListener('click', () => sendFriendRequest(userId));
                        friendActionButtonContainer.appendChild(sendRequestBtn);
                    }


                    // Show/hide ban button (only for admins, and not on self)
                    if (currentUserData.role === 'admin' && userId !== currentUserId) {
                        banUserFromProfileBtn.classList.remove('hidden');
                        banUserFromProfileBtn.onclick = async () => {
                            banUserFromProfileBtn.disabled = true;
                            await updateUserStatus(userId, 'banned', true);
                            banUserFromProfileBtn.disabled = false;
                        };
                    } else {
                        banUserFromProfileBtn.classList.add('hidden');
                    }

                    // Show/hide kick button (for admins/moderators, and not on self)
                    if ((currentUserData?.role === 'admin' || currentUserData?.role === 'moderator') && userId !== currentUserId) {
                        kickUserFromProfileBtn.classList.remove('hidden');
                        kickUserFromProfileBtn.onclick = async () => {
                            kickUserFromProfileBtn.disabled = true;
                            await kickUser(userId);
                            kickUserFromProfileBtn.disabled = false;
                        };
                    } else {
                        kickUserFromProfileBtn.classList.add('hidden');
                    }

                    // Render Viewed User's Friends List
                    viewedUserFriendsList.innerHTML = '';
                    if (userData.friends && userData.friends.length > 0) {
                        for (const friendId of userData.friends) {
                            const friendDoc = await getDoc(doc(db, `artifacts/${appId}/user_profiles`, friendId));
                            if (friendDoc.exists()) {
                                const friendData = friendDoc.data();
                                const friendItem = document.createElement('div');
                                friendItem.className = 'friend-list-item';
                                friendItem.innerHTML = `
                                    <img src="${friendData.displayImage || getAvatarUrl(friendData.displayName, 32)}" alt="${sanitizeHTML(friendData.displayName)}" class="author-avatar" loading="lazy">
                                    <button class="font-semibold text-blue-400 hover:underline view-user-profile-btn" data-user-id="${friendId}">${sanitizeHTML(friendData.displayName)}</button>
                                `;
                                viewedUserFriendsList.appendChild(friendItem);
                            }
                        }
                        viewedUserFriendsList.querySelectorAll('.view-user-profile-btn').forEach(btn => {
                            btn.addEventListener('click', (event) => {
                                const userId = event.target.dataset.userId;
                                showUserProfileView(userId, 'userProfileView'); // Nested view
                            });
                        });
                    } else {
                        viewedUserFriendsList.innerHTML = '<p class="text-gray-400">This user has no friends yet.</p>';
                    }


                    // Fetch and display posts by this user across all collections
                    const allPostsByUser = [];
                    const collections = ['snippets', 'bugFixes', 'askForHelp'];
                    for (const col of collections) {
                        const postsRef = collection(db, `artifacts/${appId}/public/data/${col}`);
                        const q = query(postsRef);
                        const querySnapshot = await getDocs(q); // Fetch all for this specific user's profile view
                        querySnapshot.forEach(doc => {
                            const postData = doc.data();
                            if (postData.authorId === userId) {
                                allPostsByUser.push({ id: doc.id, collectionName: col, ...postData }); // Add collectionName
                            }
                        });
                    }
                    allPostsByUser.sort((a, b) => (b.timestamp?.toDate() || 0) - (a.timestamp?.toDate() || 0));
                    await renderPosts(allPostsByUser, viewedUserPostsList, false, true); // Render posts in the user profile view, truncated, and enable admin buttons

                    // Fetch and display comments by this user across all posts
                    const allCommentsByUser = [];
                    for (const col of collections) {
                        const postsRef = collection(db, `artifacts/${appId}/public/data/${col}`);
                        const postsSnapshot = await getDocs(postsRef);
                        for (const postDoc of postsSnapshot.docs) {
                            const commentsRef = collection(db, `artifacts/${appId}/public/data/${col}/${postDoc.id}/comments`);
                            const commentsSnapshot = await getDocs(commentsRef);
                            commentsSnapshot.forEach(commentDoc => {
                                const commentData = commentDoc.data();
                                if (commentData.authorId === userId) {
                                    allCommentsByUser.push({
                                        id: commentDoc.id,
                                        postId: postDoc.id,
                                        collectionName: col,
                                        ...commentData
                                    });
                                }
                            });
                        }
                    }
                    allCommentsByUser.sort((a, b) => (b.timestamp?.toDate() || 0) - (a.timestamp?.toDate() || 0));
                    renderCommentsForUserProfile(allCommentsByUser, viewedUserCommentsList, true); // Render comments in user profile view, with admin buttons

                } else {
                    viewedUserDisplayName.textContent = 'User Not Found';
                    viewedUserEmail.textContent = '';
                    viewedUserRole.textContent = '';
                    viewedUserVerified.textContent = '';
                    viewedUserId.textContent = userId;
                    viewedUserBio.textContent = 'Bio: Not set';
                    viewedUserAvatar.src = getAvatarUrl(null, 100);
                    friendActionButtonContainer.innerHTML = ''; // Clear friend actions
                    banUserFromProfileBtn.classList.add('hidden');
                    kickUserFromProfileBtn.classList.add('hidden'); // Also hide kick button
                    viewedUserFriendsList.innerHTML = '<p class="text-gray-400">This user has no friends yet.</p>';
                    viewedUserPostsList.innerHTML = '';
                    noUserPostsMessage.classList.remove('hidden');
                    viewedUserCommentsList.innerHTML = '';
                    noUserCommentsMessage.classList.remove('hidden');
                }
            } catch (error) {
                console.error("Error showing user profile view:", error);
                showMessage("Failed to load user profile: " + error.message, 'error');
            } finally {
                hideLoading();
            }
        }

        /**
         * Renders comments specifically for the user profile view.
         * @param {Array} commentsToRender - The array of comments to render.
         * @param {HTMLElement} targetElement - The DOM element where comments should be rendered.
         * @param {boolean} isUserProfileView - True if rendering for user profile view (always true for this function).
         */
        async function renderCommentsForUserProfile(commentsToRender, targetElement, isUserProfileView) {
            targetElement.innerHTML = '';
            if (commentsToRender.length === 0) {
                noUserCommentsMessage.classList.remove('hidden');
                return;
            } else {
                noUserCommentsMessage.classList.add('hidden');
            }

            for (const comment of commentsToRender) {
                let authorProfile = { displayName: 'Anonymous', displayImage: null, verified: false, bio: '' }; // Include bio
                if (comment.authorId) {
                    const authorDocRef = doc(db, `artifacts/${appId}/user_profiles`, comment.authorId);
                    const authorDocSnap = await getDoc(authorDocRef);
                    if (authorDocSnap.exists()) {
                        authorProfile = authorDocSnap.data();
                    }
                }

                const commentElement = document.createElement('div');
                commentElement.className = `comment-item ${comment.onHold && (currentUserData?.role === 'admin' || currentUserData?.role === 'moderator') ? 'on-hold-item' : ''}`;
                commentElement.innerHTML = `
                            <div class="comment-author-info">
                                <img src="${authorProfile.displayImage || getAvatarUrl(authorProfile.displayName, 36)}" alt="${sanitizeHTML(authorProfile.displayName)}" class="comment-avatar" loading="lazy">
                                <div>
                                    <button class="font-semibold text-sm text-blue-400 hover:underline view-user-profile-btn" data-user-id="${comment.authorId}">
                                        ${sanitizeHTML(authorProfile.displayName || 'Anonymous')}
                                        ${authorProfile.verified ? '<span class="verified-emoji">✅</span>' : ''}
                                    </button>
                                    ${comment.onHold && (currentUserData?.role === 'admin' || currentUserData?.role === 'moderator') ? '<span class="on-hold-badge">On Hold</span>' : ''}
                                    <p class="text-xs text-gray-400">ID: ${truncateUserId(comment.authorId)}</p>
                                    <p class="text-xs text-gray-500">${comment.timestamp ? new Date(comment.timestamp.toDate()).toLocaleString() : 'N/A'}</p>
                                </div>
                            </div>
                            <p class="text-sm">${sanitizeHTML(comment.content)}</p>
                            ${isUserProfileView && (currentUserData?.role === 'admin' || currentUserData?.role === 'moderator') ? `
                                <div class="flex flex-wrap gap-2 mt-2">
                                    <button class="btn ${comment.onHold ? 'btn-primary' : 'btn-secondary'} text-xs toggle-comment-hold-btn" data-post-id="${comment.postId}" data-comment-id="${comment.id}" data-collection-name="${comment.collectionName}" data-on-hold="${comment.onHold}">
                                        ${comment.onHold ? 'Activate Comment' : 'Put On Hold'}
                                    </button>
                                    <button class="btn btn-danger text-xs delete-comment-from-profile-btn" data-post-id="${comment.postId}" data-comment-id="${comment.id}" data-collection-name="${comment.collectionName}">
                                        Delete Comment
                                    </button>
                                </div>
                            ` : ''}
                `;
                targetElement.appendChild(commentElement);

                // Attach event listeners for admin actions in user profile view comments
                if (isUserProfileView && (currentUserData?.role === 'admin' || currentUserData?.role === 'moderator')) {
                    const toggleHoldBtn = commentElement.querySelector('.toggle-comment-hold-btn');
                    if (toggleHoldBtn) {
                        toggleHoldBtn.addEventListener('click', async () => {
                            toggleHoldBtn.disabled = true;
                            const postId = toggleHoldBtn.dataset.postId;
                            const commentId = toggleHoldBtn.dataset.commentId;
                            const collectionName = toggleHoldBtn.dataset.collectionName;
                            const currentOnHold = toggleHoldBtn.dataset.onHold === 'true';
                            await toggleCommentOnHold(collectionName, postId, commentId, currentOnHold);
                            toggleHoldBtn.disabled = false;
                        });
                    }
                    const deleteBtn = commentElement.querySelector('.delete-comment-from-profile-btn');
                    if (deleteBtn) {
                        deleteBtn.addEventListener('click', async () => {
                            await deleteComment(deleteBtn.dataset.collectionName, deleteBtn.dataset.postId, deleteBtn.dataset.commentId);
                        });
                    }
                }

                // Attach event listener for viewing user profile from comments
                const viewProfileButton = commentElement.querySelector(`.view-user-profile-btn[data-user-id="${comment.authorId}"]`);
                if (viewProfileButton) {
                    viewProfileButton.addEventListener('click', (event) => {
                        const userId = event.target.dataset.userId;
                        showUserProfileView(userId, 'postDetail'); // Now any user can view
                    });
                }
            }
        }


        // Back button for User Profile View
        backToPreviousViewBtn.addEventListener('click', () => {
            hideAllSections();
            if (previousView === 'postDetail' && currentPostIdForDetail) {
                // Find the post object in allFetchedPosts to re-display the detail page
                const post = allFetchedPosts.find(p => p.id === currentPostIdForDetail);
                if (post) {
                    showPostDetailPage(post);
                } else {
                    // Fallback if post not found (e.g., deleted), go to main posts
                    switchTab(currentTab);
                }
            }
            else if (previousView === 'myProfile') {
                switchTab('myProfile'); // Go back to my profile if that was the origin
            }
            else {
                switchTab(currentTab); // Go back to the main posts list of the current tab
            }
        });

        // --- Initial Load ---

        window.onload = initializeFirebase;