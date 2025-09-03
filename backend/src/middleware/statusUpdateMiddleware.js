import Beneficiaries from "../models/Beneficiaries.js";
import cron from "node-cron";

// Middleware to check and update beneficiary status on each request
export const checkBeneficiaryStatus = async (req, res, next) => {
  try {
    // Only run status check for beneficiary-related routes
    if (req.path.includes('/beneficiaries')) {
      // Update all beneficiaries' status based on completion
      await Beneficiaries.updateCompletedStatuses();
    }
    next();
  } catch (error) {
    console.error('Error in status update middleware:', error);
    next(); // Continue with the request even if status update fails
  }
};

// Scheduled job to run daily at midnight to update beneficiary statuses
export const scheduledStatusUpdate = () => {
  // Run every day at midnight (00:00)
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('Running scheduled beneficiary status update...');
      const updatedBeneficiaries = await Beneficiaries.updateCompletedStatuses();
      console.log(`Updated ${updatedBeneficiaries.length} beneficiaries to completed status`);
    } catch (error) {
      console.error('Error in scheduled status update:', error);
    }
  }, {
    timezone: "Africa/Johannesburg" // Set to user's timezone
  });

  console.log('Scheduled status update job initialized');
};

// Manual function to update all beneficiary statuses
export const updateAllBeneficiaryStatuses = async () => {
  try {
    const updatedBeneficiaries = await Beneficiaries.updateCompletedStatuses();
    return {
      success: true,
      message: `Updated ${updatedBeneficiaries.length} beneficiaries`,
      count: updatedBeneficiaries.length
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};

// Middleware to add beneficiary completion info to response
export const addCompletionInfo = async (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    try {
      if (req.path.includes('/beneficiaries') && req.method === 'GET') {
        const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        
        if (parsedData.success && parsedData.data) {
          // Add completion info for single beneficiary
          if (parsedData.data._id && !Array.isArray(parsedData.data)) {
            const beneficiary = parsedData.data;
            parsedData.data.daysRemaining = beneficiary.getDaysRemaining ? beneficiary.getDaysRemaining() : 0;
            parsedData.data.programProgress = beneficiary.totalProgramDays > 0 
              ? Math.round((beneficiary.completedDays / beneficiary.totalProgramDays) * 100) 
              : 0;
          }
          
          // Add completion info for array of beneficiaries
          if (Array.isArray(parsedData.data)) {
            parsedData.data = parsedData.data.map(beneficiary => {
              if (beneficiary._id) {
                beneficiary.daysRemaining = beneficiary.getDaysRemaining ? beneficiary.getDaysRemaining() : 0;
                beneficiary.programProgress = beneficiary.totalProgramDays > 0 
                  ? Math.round((beneficiary.completedDays / beneficiary.totalProgramDays) * 100) 
                  : 0;
              }
              return beneficiary;
            });
          }
        }
        
        data = typeof data === 'string' ? JSON.stringify(parsedData) : parsedData;
      }
    } catch (error) {
      console.error('Error in completion info middleware:', error);
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

export default {
  checkBeneficiaryStatus,
  scheduledStatusUpdate,
  updateAllBeneficiaryStatuses,
  addCompletionInfo
};