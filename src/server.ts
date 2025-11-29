import app from './app';
import 'dotenv/config';

const port = Number(process.env.PORT || 3333);

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
