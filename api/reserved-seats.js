<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
    <title>속초고등학교 공간 예약 서비스</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.4.1/font/bootstrap-icons.css" rel="stylesheet" />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        .seat-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 10px;
            padding: 10px;
        }
        .reserved {
            background-color: #dc3545 !important;
            color: white !important;
            cursor: not-allowed;
            opacity: 1;
            border: none !important;
        }
        .seat {
            height: 50px;
            font-size: 1.1rem;
        }
        .seat.btn-primary {
            border: none;
        }
        .reserved:hover {
            background-color: #dc3545 !important;
            color: white !important;
            cursor: not-allowed;
        }
        .school-logo {
            height: 40px;
            width: 40px;
            margin-right: 10px;
            object-fit: contain;
        }
    </style>
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container px-lg-5">
            <a class="navbar-brand" href="#!">
                <img src="/mascot.png" alt="마스코트" class="school-logo">
                속초고등학교
            </a>
        </div>
    </nav>

    <header class="py-5">
        <div class="container px-lg-5">
            <div class="p-4 p-lg-5 bg-light rounded-3">
                <h2 class="text-center mb-4">공간 예약</h2>
                <form id="reservation-form">
                    <div class="row g-3">
                        <div class="col-md-6">
                            <label class="form-label">이름</label>
                            <input type="text" id="name" class="form-control" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">학번</label>
                            <input type="number" id="student-id" class="form-control" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">이메일</label>
                            <input type="email" id="email" class="form-control" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">예약 날짜</label>
                            <input type="date" id="date" class="form-control" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">공간 유형</label>
                            <select id="room-type" class="form-select" required>
                                <option value="study">개별 학습실</option>
                                <option value="discussion">독서토론실</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">예약 시간</label>
                            <select id="time-slot" class="form-select" required>
                                <option value="">시간을 선택하세요</option>
                                <option value="07:30 - 08:30">07:30 - 08:30</option>
                                <option value="12:30 - 13:30">12:30 - 13:30</option>
                                <option value="16:30 - 17:30">16:30 - 17:30</option>
                                <option value="(목요일 한정) 15:30 - 16:30">(목요일 한정) 15:30 - 16:30</option>
                            </select>
                        </div>
                        
                        <div id="floor-selection" class="col-md-6 d-none">
                            <label class="form-label">층 선택</label>
                            <select id="floor" class="form-select">
                                <option value="">층을 선택하세요</option>
                                <option value="2F">2층</option>
                                <option value="4F">4층</option>
                            </select>
                        </div>

                        <div id="seat-selection" class="col-12 d-none">
                            <div class="card p-3 mt-3">
                                <label class="form-label">좌석 선택</label>
                                <div id="seat-buttons" class="seat-grid"></div>
                                <input type="hidden" id="seat" name="seat">
                            </div>
                        </div>

                        <div class="col-12 text-center mt-4">
                            <button type="submit" class="btn btn-primary btn-lg px-5">예약하기</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </header>

    <footer class="py-5 bg-dark">
        <div class="container">
            <p class="m-0 text-center text-white">Copyright &copy; 속초고등학교 2025</p>
        </div>
    </footer>

    <script>
        document.addEventListener("DOMContentLoaded", function () {
            const roomType = document.getElementById("room-type");
            const seatSelection = document.getElementById("seat-selection");
            const seatButtonsContainer = document.getElementById("seat-buttons");
            const floorSelection = document.getElementById("floor-selection");
            const dateInput = document.getElementById("date");
            const timeSlot = document.getElementById("time-slot");
            const specialTime = timeSlot.querySelector('option[value="(목요일 한정) 15:30 - 16:30"]');

            // 날짜 제한 설정
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            dateInput.min = tomorrow.toISOString().split('T')[0];

            const maxDate = new Date(today);
            maxDate.setDate(maxDate.getDate() + 30);
            dateInput.max = maxDate.toISOString().split('T')[0];

            // 좌석 생성 함수
            function generateSeats() {
                seatButtonsContainer.innerHTML = "";
                for (let i = 1; i <= 10; i++) {
                    const button = document.createElement("button");
                    button.type = "button";
                    button.className = "btn btn-outline-secondary seat w-100 py-3";
                    button.dataset.seat = i;
                    button.textContent = i;
                    button.addEventListener("click", function() {
                        document.querySelectorAll(".seat").forEach(btn => 
                            btn.classList.remove("btn-primary"));
                        this.classList.add("btn-primary");
                        document.getElementById("seat").value = this.dataset.seat;
                    });
                    seatButtonsContainer.appendChild(button);
                }
                
                // 예약된 좌석 상태 업데이트
                if (dateInput.value && timeSlot.value) {
                    updateSeats();
                }
            }

            // 좌석 예약 상태 가져오기
            async function fetchReservedSeats(date, timeSlot) {
                try {
                    console.log("fetchReservedSeats 호출됨:", { date, timeSlot });
                    
                    const response = await fetch(`/api/reserved-seats?date=${date}&time=${timeSlot}`, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || '서버 응답 오류');
                    }
                    
                    const data = await response.json();
                    console.log("예약된 좌석 데이터:", data);
                    return data.reservedSeats || [];
                } catch (error) {
                    console.error("🚨 API 호출 오류:", error);
                    return [];
                }
            }

            // 좌석 상태 업데이트
            async function updateSeats() {
                const date = dateInput.value;
                const time = timeSlot.value;
                
                console.log("updateSeats 호출됨:", { date, time });
                
                if (!date || !time) {
                    console.log("날짜 또는 시간이 선택되지 않음");
                    return;
                }
                
                const reservedSeats = await fetchReservedSeats(date, time);
                console.log("업데이트할 예약 좌석:", reservedSeats);
                
                document.querySelectorAll(".seat").forEach(button => {
                    const seatNumber = Number(button.dataset.seat);
                    if (reservedSeats.includes(seatNumber)) {
                        button.classList.add("reserved");
                        button.disabled = true;
                        button.title = "이미 예약된 좌석입니다";
                    } else {
                        button.classList.remove("reserved");
                        button.disabled = false;
                        button.title = "";
                    }
                });
            }

            // 날짜 유효성 검사
            function isValidDate(date) {
                const selectedDate = new Date(date);
                const day = selectedDate.getDay();
                
                if (selectedDate < tomorrow) {
                    return { valid: false, message: "🚫 내일부터 예약 가능합니다." };
                }

                if (selectedDate > maxDate) {
                    return { valid: false, message: "🚫 30일 이후는 예약할 수 없습니다." };
                }

                if (day === 0 || day === 6) {
                    return { valid: false, message: "🚫 주말은 예약할 수 없습니다." };
                }

                return { valid: true };
            }

            // 폼 초기화 함수
            function resetForm() {
                document.getElementById("reservation-form").reset();
                seatButtonsContainer.innerHTML = "";
                if (roomType.value === "study") {
                    generateSeats();
                }
            }

            // 공간 유형에 따른 UI 업데이트
            function toggleSelections() {
                if (roomType.value === "study") {
                    seatSelection.classList.remove("d-none");
                    floorSelection.classList.remove("d-none");
                    generateSeats();
                } else {
                    seatSelection.classList.add("d-none");
                    floorSelection.classList.add("d-none");
                    document.getElementById("seat").value = "";
                    document.getElementById("floor").value = "";
                }
            }

            // 이벤트 리스너 등록
            dateInput.addEventListener("change", function() {
                console.log("날짜 변경됨:", this.value);
                if (this.value) {
                    const validation = isValidDate(this.value);
                    if (!validation.valid) {
                        alert(validation.message);
                        this.value = "";
                        return;
                    }

                    const selectedDate = new Date(this.value);
                    const day = selectedDate.getDay();
                    
                    if (day === 4) {
                        specialTime.disabled = false;
                    } else {
                        specialTime.disabled = true;
                        if (timeSlot.value === "(목요일 한정) 15:30 - 16:30") {
                            timeSlot.value = "";
                        }
                    }

                    if (timeSlot.value) {
                        updateSeats();
                    }
                }
            });

            timeSlot.addEventListener("change", function() {
                console.log("시간 변경됨:", this.value);
                if (dateInput.value) {
                    updateSeats();
                }
            });

            roomType.addEventListener("change", toggleSelections);

            // 폼 제출 처리
            document.getElementById("reservation-form").addEventListener("submit", async function(e) {
                e.preventDefault();

                const formData = {
                    name: document.getElementById("name").value,
                    studentId: document.getElementById("student-id").value,
                    email: document.getElementById("email").value,
                    date: dateInput.value,
                    roomType: roomType.value,
                    floor: document.getElementById("floor").value || "N/A",
                    seat: document.getElementById("seat").value || "N/A",
                    timeSlot: timeSlot.value
                };

                // 유효성 검사
                if (!formData.date || !formData.timeSlot) {
                    alert("🚨 날짜와 시간을 선택해주세요!");
                    return;
                }

                const dateValidation = isValidDate(formData.date);
                if (!dateValidation.valid) {
                    alert(dateValidation.message);
                    return;
                }

                if (formData.roomType === "study") {
                    if (!formData.seat || formData.seat === "N/A") {
                        alert("🚨 좌석을 선택해주세요!");
                        return;
                    }
                    if (!formData.floor || formData.floor === "N/A") {
                        alert("🚨 층을 선택해주세요!");
                        return;
                    }
                }

                try {
                    console.log("예약 요청 데이터:", formData);
                    
                    const response = await fetch("/api/notion", {
                        method: "POST",
                        headers: { 
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(formData),
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.message || "예약 실패");
                    }

                    alert("✅ 예약이 완료되었습니다!");
                    resetForm();
                } catch (error) {
                    console.error("예약 오류:", error);
                    alert(`❌ ${error.message || "예약 중 오류가 발생했습니다. 다시 시도해주세요."}`);
                }
            });

            // 초기 UI 설정
            toggleSelections();
        });
    </script>
</body>
</html>
