let timeslots = [];
let lecturers = [];
let courses = [];

function updateDropdowns() {
  const lecturerSlots = document.getElementById('lecturerSlots');
  const courseLecturer = document.getElementById('courseLecturer');

  lecturerSlots.innerHTML = '';
  courseLecturer.innerHTML = '';

  timeslots.forEach((slot, i) => {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = slot;
    lecturerSlots.appendChild(option);
  });

  lecturers.forEach(lect => {
    const option = document.createElement('option');
    option.value = lect.name;
    option.textContent = lect.name;
    courseLecturer.appendChild(option);
  });
}

function addTimeslot() {
  const input = document.getElementById('timeslotInput');
  if (input.value.trim()) {
    timeslots.push(input.value.trim());
    document.getElementById('timeslotList').innerHTML += `<li>${input.value.trim()}</li>`;
    input.value = '';
    updateDropdowns();
  }
}

function addLecturer() {
  const name = document.getElementById('lecturerName').value.trim();
  const selectedSlots = Array.from(document.getElementById('lecturerSlots').selectedOptions).map(opt => Number(opt.value));
  if (name && selectedSlots.length > 0) {
    lecturers.push({ name, availableSlots: selectedSlots });
    document.getElementById('lecturerList').innerHTML += `<li>${name} – Available: ${selectedSlots.map(i => timeslots[i]).join(", ")}</li>`;
    document.getElementById('lecturerName').value = '';
    updateDropdowns();
  }
}

function addCourse() {
  const title = document.getElementById('courseTitle').value.trim();
  const dept = document.getElementById('courseDept').value.trim();
  const lecturer = document.getElementById('courseLecturer').value;

  if (title && dept && lecturer) {
    courses.push({ title, dept, lecturer });
    document.getElementById('courseList').innerHTML += `<li>${title} (${dept}) – ${lecturer}</li>`;
    document.getElementById('courseTitle').value = '';
    document.getElementById('courseDept').value = '';
  }
}

// Genetic Algorithm Section
function createRandomSchedule() {
  return courses.map(course => {
    const lecturer = lecturers.find(l => l.name === course.lecturer);
    const slot = lecturer.availableSlots[Math.floor(Math.random() * lecturer.availableSlots.length)];
    return { ...course, timeslot: slot };
  });
}

function fitness(schedule) {
  let score = 0;
  const used = new Set();

  for (const cls of schedule) {
    const key = `${cls.lecturer}-${cls.timeslot}`;
    if (!used.has(key)) {
      used.add(key);
      score++;
    }
  }

  return score;
}

function crossover(p1, p2) {
  const point = Math.floor(Math.random() * p1.length);
  return p1.slice(0, point).concat(p2.slice(point));
}

function mutate(schedule) {
  const i = Math.floor(Math.random() * schedule.length);
  const lecturer = lecturers.find(l => l.name === schedule[i].lecturer);
  schedule[i] = {
    ...schedule[i],
    timeslot: lecturer.availableSlots[Math.floor(Math.random() * lecturer.availableSlots.length)]
  };
  return schedule;
}

function generateTimetable() {
  if (courses.length === 0 || lecturers.length === 0 || timeslots.length === 0) {
    alert("Please add time slots, lecturers and courses first.");
    return;
  }

  let population = Array.from({ length: 10 }, createRandomSchedule);

  for (let i = 0; i < 100; i++) {
    population.sort((a, b) => fitness(b) - fitness(a));
    const elite = population.slice(0, 2);
    const nextGen = [...elite];

    while (nextGen.length < 10) {
      let child = crossover(elite[0], elite[1]);
      nextGen.push(mutate(child));
    }

    population = nextGen;
  }

  displayTimetable(population[0]);
}

function displayTimetable(schedule) {
  let html = `<h2>Generated Timetable</h2><table>
    <tr><th>Course</th><th>Department</th><th>Lecturer</th><th>Time Slot</th></tr>`;

  schedule.forEach(cls => {
    html += `<tr>
      <td>${cls.title}</td>
      <td>${cls.dept}</td>
      <td>${cls.lecturer}</td>
      <td>${timeslots[cls.timeslot]}</td>
    </tr>`;
  });

  html += `</table>`;
  document.getElementById("timetable").innerHTML = html;
}

function printTimetable() {
  const printContents = document.getElementById('timetable').innerHTML;
  const win = window.open('', '', 'width=800,height=600');
  win.document.write(`<html><head><title>Print Timetable</title>`);
  win.document.write(`<style>table{width:100%;border-collapse:collapse}th,td{border:1px solid #000;padding:8px;text-align:center}</style>`);
  win.document.write(`</head><body>${printContents}</body></html>`);
  win.document.close();
  win.print();
}
