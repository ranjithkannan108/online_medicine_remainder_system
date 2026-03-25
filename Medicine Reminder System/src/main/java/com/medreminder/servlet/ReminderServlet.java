package com.medreminder.servlet;

import com.medreminder.dao.MedicineDAO;
import com.medreminder.model.Medicine;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@WebServlet("/api/reminders")
public class ReminderServlet extends HttpServlet {

    private MedicineDAO medicineDAO = new MedicineDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            out.print("{\"success\": false, \"message\": \"Not logged in\"}");
            out.flush();
            return;
        }

        int userId = (int) session.getAttribute("userId");
        List<Medicine> allMedicines = medicineDAO.getAllByUser(userId);
        String today = LocalDate.now().toString();

        List<Medicine> todayMedicines = new ArrayList<>();
        for (Medicine m : allMedicines) {
            boolean inRange = true;
            if (m.getStartDate() != null && !m.getStartDate().isEmpty() && today.compareTo(m.getStartDate()) < 0) {
                inRange = false;
            }
            if (m.getEndDate() != null && !m.getEndDate().isEmpty() && today.compareTo(m.getEndDate()) > 0) {
                inRange = false;
            }
            if (inRange && m.getTimes() != null && !m.getTimes().isEmpty()) {
                todayMedicines.add(m);
            }
        }

        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < todayMedicines.size(); i++) {
            Medicine m = todayMedicines.get(i);
            if (i > 0) json.append(",");
            json.append("{\"id\":").append(m.getId())
                .append(",\"name\":\"").append(escape(m.getName())).append("\"")
                .append(",\"dosage\":\"").append(escape(m.getDosage())).append("\"")
                .append(",\"quantity\":").append(m.getQuantity())
                .append(",\"times\":\"").append(escape(m.getTimes())).append("\"")
                .append("}");
        }
        json.append("]");

        out.print("{\"success\": true, \"reminders\": " + json.toString() + "}");
        out.flush();
    }

    private String escape(String str) {
        if (str == null) return "";
        return str.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
