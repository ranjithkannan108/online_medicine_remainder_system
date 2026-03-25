package com.medreminder.servlet;

import com.medreminder.dao.UserDAO;
import com.medreminder.model.User;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;

@WebServlet("/api/register")
public class RegisterServlet extends HttpServlet {
    private UserDAO userDAO;

    @Override
    public void init() {
        userDAO = new UserDAO();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        String username = request.getParameter("username");
        String name = request.getParameter("name");
        String password = request.getParameter("password");

        if (username == null || username.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"success\": false, \"message\": \"Username and password are required\"}");
            out.flush();
            return;
        }

        User newUser = new User();
        newUser.setUsername(username);
        newUser.setName(name);
        newUser.setPassword(password);

        boolean success = userDAO.register(newUser);

        if (success) {
            out.print("{\"success\": true, \"message\": \"Registration successful\"}");
        } else {
            response.setStatus(HttpServletResponse.SC_CONFLICT);
            out.print("{\"success\": false, \"message\": \"Registration failed. Username might already exist.\"}");
        }
        
        out.flush();
    }
}
