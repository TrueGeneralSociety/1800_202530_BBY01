document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("add-deadline-form");

    const params = new URLSearchParams(window.location.search);
    const school = params.get("school");
    const program = params.get("program");
    const term = params.get("term");
    const channel = params.get("channel");
    const courseName = params.get("course");

    if (!school || !program || !term || !channel || !courseName) {
        alert("Missing course/channel info in URL");
        return;
    }

    // 페이지 로딩 시 단 한 번만 auth 체크
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            // user 없으면 index 이동
            window.location.href = "/index.html";
            return;
        }

        // submit 이벤트 정의
        form.addEventListener("submit", async (e) => {
            e.preventDefault(); // 페이지 리로드 방지

            const taskName = document.getElementById("taskName").value.trim();
            const deadlineDateTime = document.getElementById("deadlineDateTime").value;
            const notes = document.getElementById("notes").value.trim();

            if (!taskName || !deadlineDateTime) {
                alert("Task name and deadline are required");
                return;
            }

            const timestamp = Date.now();
            const deadlineId = `${taskName}-${timestamp}`;

            const deadlineRef = doc(
                db,
                "schools", school,
                "programs", program,
                "terms", term,
                "channels", channel,
                "courses", courseName,
                "deadlines", deadlineId
            );

            try {
                await setDoc(deadlineRef, {
                    taskName,
                    deadlineDateTime,
                    notes,
                    createdAt: serverTimestamp(),
                    createdBy: user.uid
                });

                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);
                const userData = userSnap.data() || {};
                const userCourseData = userData.courses?.[courseName] || {};

                await setDoc(
                    userRef,
                    {
                        courses: {
                            [courseName]: {
                                ...userCourseData,
                                deadlines: {
                                    ...userCourseData.deadlines,
                                    [deadlineId]: true
                                }
                            }
                        }
                    },
                    { merge: true }
                );

                alert("Deadline added successfully!");
                // 절대 경로 사용
                window.location.href = `/html/deadlineList.html?school=${encodeURIComponent(school)}&program=${encodeURIComponent(program)}&term=${encodeURIComponent(term)}&channel=${encodeURIComponent(channel)}&course=${encodeURIComponent(courseName)}`;

            } catch (err) {
                console.error(err);
                alert("Failed to add deadline");
            }
        });
    });
});
