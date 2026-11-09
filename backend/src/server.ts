import app from './app';
import { connectDB } from './config/db';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    app.listen(PORT, () => {
      console.log(`[Server] Finance Tracker API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error: any) {
    console.error(`[Server Error] Failed to initialize server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

