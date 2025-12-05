import { contractsApi } from "./api";

/**
 * Get paginated contracts with summary statistics
 */
export const getContracts = async (page = 1, perPage = 15) => {
  try {
    const response = await contractsApi.getAll(page, perPage);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch contracts:", error);
    throw error;
  }
};

/**
 * Get single contract by ID
 */
export const getContractById = async (id) => {
  try {
    const response = await contractsApi.getById(id);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch contract ${id}:`, error);
    throw error;
  }
};

/**
 * Create new contract
 */
export const createContract = async (data) => {
  try {
    const response = await contractsApi.create(data);
    return response.data;
  } catch (error) {
    console.error("Failed to create contract:", error);
    throw error;
  }
};

/**
 * Update existing contract
 */
export const updateContract = async (id, data) => {
  try {
    const response = await contractsApi.update(id, data);
    return response.data;
  } catch (error) {
    console.error(`Failed to update contract ${id}:`, error);
    throw error;
  }
};

/**
 * Get next contract number for a given year
 */
export const getNextContractNumber = async (year) => {
  try {
    const response = await contractsApi.getNextNumber(year);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch next contract number for ${year}:`, error);
    throw error;
  }
};
