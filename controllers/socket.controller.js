import { readData, writeData } from '../utils/fileUtils.js';
import wait from '../utils/wait.js';

export const getSocketData = async (req, res) => {
  await wait(2);
  res.json(readData());
};

export const updateSocketData = (req, res, io) => {
  const newData = req.body;
  writeData(newData);
  io.emit('dataUpdated', newData);
  res.status(200).json({ message: 'Data updated successfully', data: newData });
};
