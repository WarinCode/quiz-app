interface DataStructure {
  readonly number: number;
  readonly ref_id: number;
  readonly title: string;
  readonly a: string;
  readonly b: string;
  readonly c: string;
  readonly d: string;
  readonly corret: string;
}

interface Question {
  a: HTMLLabelElement;
  b: HTMLLabelElement;
  c: HTMLLabelElement;
  d: HTMLLabelElement;
}

const labelEL: Question = {
  a: document.querySelector("#label-a")!,
  b: document.querySelector("#label-b")!,
  c: document.querySelector("#label-c")!,
  d: document.querySelector("#label-d")!,
};

interface Input {
  ans_a: HTMLInputElement;
  ans_b: HTMLInputElement;
  ans_c: HTMLInputElement;
  ans_d: HTMLInputElement;
}

const inputEL: Input = {
  ans_a: document.querySelector("#answer-a")!,
  ans_b: document.querySelector("#answer-b")!,
  ans_c: document.querySelector("#answer-c")!,
  ans_d: document.querySelector("#answer-d")!,
};

let minutes: number = 0;
let seconds: number = 0;

const btnStartEL: HTMLButtonElement = document.querySelector(".btn-start")!;
const btnResetEL: HTMLButtonElement = document.querySelector(".btn-reset")!;
const btnEL: HTMLButtonElement = document.querySelector("[type=submit]")!;
const formEL: HTMLFormElement = document.querySelector("form")!;
const question: HTMLElement = document.querySelector("#main-question")!;
const boxEL: HTMLDivElement = document.querySelector(".box")!;
const headerEL: HTMLHeadElement = document.querySelector("#header-title")!;
const imgEL: HTMLImageElement = document.querySelector("#header-img")!;
const timerEL: HTMLDivElement = document.querySelector("#timer")!;

const fetchData = async (): Promise<DataStructure[]> => {
  const res: Response = await fetch("../json/exam.json");
  const data: DataStructure[] = await res.json();
  try {
    const sliceData: DataStructure[] = data.slice(0, 10);
    return sliceData;
  } catch (error: unknown) {
    throw new Error(`${error}`);
  }
};
const examination: Promise<DataStructure[]> = fetchData();

(async (): Promise<void> => {
  boxEL.style.display = "none";
  btnEL.style.display = "none";
  btnResetEL.style.display = "none";
  timerEL.style.display = "none";
  btnStartEL.addEventListener("click", async (e: Event): Promise<void> => {
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

async function start(): Promise<void> {
  await timer();
  await examination
    .then(async (data: DataStructure[]): Promise<void> => {
      let idx: number = 0;
      let count: number = 0;
      let score: number = 0;
      const MAX: number = 10;
      const answer: string[] = [];
      let completed: boolean = false;
      data.filter(async (a: DataStructure): Promise<void> => {
        answer.push(a.corret);
      });

      (async (): Promise<void> => {
        changeQuestion();
        console.log(answer);
      })();

      formEL.addEventListener("submit", async (e: Event): Promise<void> => {
        e.preventDefault();
        calculateScore();
        idx += 1;
        count += 1;
        changeQuestion();

        if (count === MAX) {
          completed = true;
          finish();
        } else if (completed) {
          const ask = confirm(
            "Error! คุณทำข้อสอบเสร็จแล้ว\nคุณต้องการทำข้อสอบอีกครั้งใหม?"
          );
          ask ? repeatExam() : 0;
        }
      });

      async function finish(): Promise<void>{
        boxEL.style.display = "none";
        btnResetEL.style.display = "none";
        headerEL.style.display = "contents";
        imgEL.style.display = "flex";
        imgEL.style.margin = "auto";
        imgEL.setAttribute("src" , "../img/task-actions.png");
        timerEL.style.display = "none";
        btnEL.style.position = "relative";
        btnEL.style.top = "70%";
        btnEL.style.display = "block";
        btnEL.textContent = "ทำข้อสอบอีกครั้ง";
        headerEL.innerHTML = `${await scoreSummary(score)}`;
      }

      async function scoreSummary(s: number): Promise<string> {
        return `คุณสอบได้ ${s} คะแนน`;
      }

      async function repeatExam(): Promise<void> {
        (async ():Promise<void> => {
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

      async function changeQuestion(): Promise<void> {
        question.textContent = String(
          `${data[idx].number}. ${data[idx].title}`
        );
        labelEL.a.textContent = data[idx].a;
        labelEL.b.textContent = data[idx].b;
        labelEL.c.textContent = data[idx].c;
        labelEL.d.textContent = data[idx].d;
      }

      async function calculateScore(): Promise<void> {
        const allChoice: HTMLInputElement[] = [
          inputEL.ans_a,
          inputEL.ans_b,
          inputEL.ans_c,
          inputEL.ans_d,
        ];
        const arrayBool: boolean[] = [
          ...allChoice.map((bool: HTMLInputElement): boolean => bool.checked),
        ];
        async function findBool<Type extends boolean>(b: Type): Promise<void> {
          let n: number = 0;
          arrayBool.filter(async (el: boolean): Promise<void> => {
            if (el === b) n += 1;
          });
          if (n > 1 || n === 4) {
            alert(
              new Error(
                "Error! โปรดทำตามข้อแนะนำเหล่านี้\n- ไม่สามารถติ้กเลือกข้อสอบ 2 ช่องหรือมากว่านี้ได้ติ้กได้แค่ช่องเดียว\n- โปรดเลือกข้อหรือช้อยก่อนกดปุ่มไปข้อต่อไป"
              )
            );
            window.location.reload();
          }
        }
        arrayBool.includes(true)
          ? findBool<boolean>(true)
          : findBool<boolean>(false);

        const choiceIdx: number = arrayBool.indexOf(true);
        const selectChoice: string = allChoice[choiceIdx].value.toString();

        if (
          selectChoice === data[idx].corret &&
          selectChoice === answer[idx] &&
          count <= 10
        ) {
          score++;
        }
      }
    })
    .catch((err: unknown) => console.error(err));
}

async function timer(): Promise<void> {
  setInterval(async (): Promise<void> => {
    seconds += 1;
    if (seconds === 60) {
      minutes += 1;
      seconds = 0;
    }
    document.querySelector("#render-time")!.innerHTML = `${minutes}:${
      seconds < 10 ? `0${seconds}` : `${seconds}`
    }`;
  }, 1000);
}
