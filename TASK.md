# Middle Node.JS Developer Test Task

**Welcome!**
We are excited to have you apply for our Middle Node.JS Developer position. This task is designed to assess your
technical skills, problem-solving abilities, and attention to detail. Good luck!

## Objective:

Develop a **Books Content Management System (CMS)** using **NestJS**, **GraphQL**, **PostgreSQL**, **Redis**, **DynamoDB
**, and **AWS**. The system should allow users to manage book information, handle large datasets efficiently, and ensure
high availability and security.

---

## Requirements

### 1. System Architecture

- Design a service for the **Books CMS** using **NestJS**.
- Use **GraphQL** to handle data fetching and mutations efficiently.

### 2. Database Design

- Use **PostgreSQL** to store relational data such as book details (e.g., title, author, publication date).
- Use **DynamoDB** to manage non-relational data such as user activity logs and book reviews.
- Implement caching mechanisms with **Redis** to enhance data retrieval performance.

### 3. Features

- **CRUD Operations:** Implement create, read, update, and delete operations for book entries.
- **Search:** Implement robust search functionality with filters (e.g., by author, title, publication year).
- **Sorting and Pagination:** Enable sorting by book attributes and pagination for large result sets.
- **User Authentication and Authorization:** Secure the system using JWT-based authentication and Access Control Lists (
  ACLs) for user permissions.
- **Rate Limiting:** Implement rate limiting to prevent system abuse.

### 4. Scalability and Performance

- Ensure the system is horizontally scalable with stateless services deployable in a load-balanced AWS environment.
- Focus on efficient query design and database indexing to handle high loads.

### 5. Security

- Secure sensitive data (e.g., user information) with appropriate measures.
- Implement security headers and error handling to prevent vulnerabilities like SQL injection, XSS, etc.

### 6. Testing

- Write unit tests and integration tests for major functionalities.
- Document instructions on how to run the tests.

### 7. Documentation

- Provide a **README** file with setup and deployment instructions.
- Document the API endpoints with example queries and mutations.

---

## Submission Guidelines

- Submit your code repository (GitHub/GitLab or equivalent) with the complete source code and relevant files.
- Ensure the code is well-commented and follows best practices.
- Provide a Postman collection or similar tool setup for API testing.

---

## Evaluation Criteria

1. **Code Quality and Readability:** Clean, modular, and well-documented code adhering to best practices.
2. **System Design:** Effective use of patterns and structures suited for high-load environments.
3. **Database Management:** Efficient design and optimization of relational and non-relational databases.
4. **Security:** Implementation of robust security measures.
5. **Performance and Scalability:** The system's ability to perform well under load and scale effectively.
6. **Testing:** Coverage and effectiveness of tests.

---

**If you have any questions, feel free to reach out. Good luck and happy coding!**
