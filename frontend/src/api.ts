const API_URL = 'http://localhost:5000/api';

export const fetchStudents = async () => {
  const res = await fetch(`${API_URL}/students`);
  return res.json();
};

export const fetchStudent = async (id: string) => {
  const res = await fetch(`${API_URL}/students/${id}`);
  return res.json();
};

export const simulateStudent = async (id: string, data: any) => {
  const res = await fetch(`${API_URL}/simulate/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const logIntervention = async (data: any) => {
  const res = await fetch(`${API_URL}/interventions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};
