"use strict";
const labelEL = {
    a: document.querySelector("#label-a"),
    b: document.querySelector("#label-b"),
    c: document.querySelector("#label-c"),
    d: document.querySelector("#label-d"),
};
const inputEL = {
    ans_a: document.querySelector("#answer-a"),
    ans_b: document.querySelector("#answer-b"),
    ans_c: document.querySelector("#answer-c"),
    ans_d: document.querySelector("#answer-d"),
};
let minutes = 0;
let seconds = 0;
const btnStartEL = document.querySelector(".btn-start");
const btnResetEL = document.querySelector(".btn-reset");
const btnEL = document.querySelector("[type=submit]");
const formEL = document.querySelector("form");
const question = document.querySelector("#main-question");
const boxEL = document.querySelector(".box");
const headerEL = document.querySelector("#header-title");
const imgEL = document.querySelector("#header-img");
const timerEL = document.querySelector("#timer");
const fetchData = async () => {
    const res = await fetch("../json/exam.json");
    const data = await res.json();
    try {
        const sliceData = data.slice(0, 10);
        return sliceData;
    }
    catch (error) {
        throw new Error(`${error}`);
    }
};
const examination = fetchData();
(async () => {
    boxEL.style.display = "none";
    btnEL.style.display = "none";
    btnResetEL.style.display = "none";
    timerEL.style.display = "none";
    btnStartEL.addEventListener("click", async (e) => {
        e.preventDefault();
        btnStartEL.style.display = "none";
        boxEL.style.display = "contents";
        btnEL.style.display = "block";
        btnResetEL.style.display = "block";
        headerEL.style.display = "none";
        imgEL.style.display = "none";
        timerEL.style.display = "contents";
        await start();
    });
})();
async function start() {
    await timer();
    await examination
        .then(async (data) => {
        let idx = 0;
        let count = 0;
        let score = 0;
        const MAX = 10;
        const answer = [];
        let completed = false;
        data.filter(async (a) => {
            answer.push(a.corret);
        });
        (async () => {
            changeQuestion();
            console.log(answer);
        })();
        formEL.addEventListener("submit", async (e) => {
            e.preventDefault();
            calculateScore();
            idx += 1;
            count += 1;
            changeQuestion();
            if (count === MAX) {
                completed = true;
                finish();
            }
            else if (completed) {
                const ask = confirm("Error! คุณทำข้อสอบเสร็จแล้ว\nคุณต้องการทำข้อสอบอีกครั้งใหม?");
                ask ? repeatExam() : 0;
            }
        });
        async function finish() {
            boxEL.style.display = "none";
            btnResetEL.style.display = "none";
            headerEL.style.display = "contents";
            imgEL.style.display = "flex";
            imgEL.style.margin = "auto";
            imgEL.setAttribute("src", "../img/task-actions.png");
            timerEL.style.display = "none";
            btnEL.style.position = "relative";
            btnEL.style.top = "70%";
            btnEL.style.display = "block";
            btnEL.textContent = "ทำข้อสอบอีกครั้ง";
            headerEL.innerHTML = `${await scoreSummary(score)}`;
        }
        async function scoreSummary(s) {
            return `คุณสอบได้คะแนน ${s} คะแนน`;
        }
        async function repeatExam() {
            (async () => {
                boxEL.style.display = "contents";
                btnResetEL.style.display = "block";
                btnEL.style.display = "block";
                btnEL.style.top = "0";
                headerEL.style.display = "none";
                imgEL.style.display = "none";
                timerEL.style.display = "block";
            })();
            completed = !completed;
            count = idx = score = 0;
            minutes = seconds = 0;
            console.clear();
            changeQuestion();
        }
        async function changeQuestion() {
            question.textContent = String(`${data[idx].number}. ${data[idx].title}`);
            labelEL.a.textContent = data[idx].a;
            labelEL.b.textContent = data[idx].b;
            labelEL.c.textContent = data[idx].c;
            labelEL.d.textContent = data[idx].d;
        }
        async function calculateScore() {
            const allChoice = [
                inputEL.ans_a,
                inputEL.ans_b,
                inputEL.ans_c,
                inputEL.ans_d,
            ];
            const arrayBool = [
                ...allChoice.map((bool) => bool.checked),
            ];
            async function findBool(b) {
                let n = 0;
                arrayBool.filter(async (el) => {
                    if (el === b)
                        n += 1;
                });
                if (n > 1 || n === 4) {
                    alert(new Error("Error! โปรดทำตามข้อแนะนำเหล่านี้\n- ไม่สามารถติ้กเลือกข้อสอบ 2 ช่องหรือมากว่านี้ได้ติ้กได้แค่ช่องเดียว\n- โปรดเลือกข้อหรือช้อยก่อนกดปุ่มไปข้อต่อไป"));
                    window.location.reload();
                }
            }
            arrayBool.includes(true)
                ? findBool(true)
                : findBool(false);
            const choiceIdx = arrayBool.indexOf(true);
            const selectChoice = allChoice[choiceIdx].value.toString();
            if (selectChoice === data[idx].corret &&
                selectChoice === answer[idx] &&
                count <= 10) {
                score++;
            }
        }
    })
        .catch((err) => console.error(err));
}
async function timer() {
    setInterval(async () => {
        seconds += 1;
        if (seconds === 60) {
            minutes += 1;
            seconds = 0;
        }
        document.querySelector("#render-time").innerHTML = `${minutes}:${seconds < 10 ? `0${seconds}` : `${seconds}`}`;
    }, 1000);
}
