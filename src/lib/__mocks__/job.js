export const mockSaveJob = jest.fn();

const Job = jest.fn().mockImplementation(() => ({
  save: mockSaveJob
}));

Job.delete = jest.fn(() => Promise.resolve());
Job.getAll = jest.fn(() => Promise.resolve([]));

export { Job };
