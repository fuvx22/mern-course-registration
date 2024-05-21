export const courseErrorClassify = (error) => {
    const message = error.response.data.error
    let errorMessage = message;
    if (message.includes("MongoServerError")) {
      errorMessage = "Mã môn học đã tồn tại"
    }
    else if (message.includes("courseId")) {
      errorMessage = "Nhập sai định dạng mã môn học"
    }
    else if (message.includes("courseCredits")) {
      errorMessage = "Số tín chỉ phải từ 1 đến 10"  
    }
    return errorMessage
}

export const majorErrorClassify = (error) => {
  const message = error.response.data.error
  let errorMessage = message;
  if (message.includes("MongoServerError")) {
    errorMessage = "Mã khoa đã tồn tại"
  }
  else if (message.includes("majorId")) {
    errorMessage = "Nhập sai định dạng mã khoa"
  }
  
  return errorMessage
}

export const semesterErrorClassify = (error) => {
  const message = error.response.data.error
  let errorMessage = message;
  if (message.includes("MongoServerError")) {
    errorMessage = "Mã học kỳ đã tồn tại"
  }
  else if (message.includes("semesterId")) {
    errorMessage = "Nhập sai định dạng mã học kỳ"
  }
  
  return errorMessage
}