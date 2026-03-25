package com.medreminder.servlet;

import com.medreminder.dao.HistoryDAO;
import com.medreminder.dao.MedicineDAO;
import com.medreminder.model.History;
import com.medreminder.model.Medicine;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

@WebServlet("/api/history")
public class HistoryServlet extends HttpServlet {

    private HistoryDAO historyDAO = new HistoryDAO();
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
        List<History> historyList = historyDAO.getAllByUser(userId);

        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < historyList.size(); i++) {
            History h = historyList.get(i);
            if (i > 0) json.append(",");
            json.append("{\"id\":").append(h.getId())
                .append(",\"medicineId\":").append(h.getMedicineId())
                .append(",\"medicineName\":\"").append(escape(h.getMedicineName())).append("\"")
                .append(",\"dosage\":\"").append(escape(h.getDosage())).append("\"")
                .append(",\"actionType\":\"").append(escape(h.getActionType())).append("\"")
                .append(",\"takenAt\":\"").append(escape(h.getTakenAt())).append("\"")
                .append("}");
        }
        json.append("]");

        out.print("{\"success\": true, \"history\": " + json.toString() + "}");
        out.flush();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
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
        int medicineId = Integer.parseInt(request.getParameter("medicineId"));
        String actionType = request.getParameter("actionType");
        if (actionType == null || actionType.trim().isEmpty()) {
            actionType = "Taken";
        }
        String medicineName = request.getParameter("medicineName");
        String dosage = request.getParameter("dosage");

        // Fallback: If medicineName wasn't sent, do a DB lookup (mostly backwards compatibility)
        if (medicineName == null || medicineName.trim().isEmpty()) {
            Medicine medicine = medicineDAO.getById(medicineId);
            if (medicine != null) {
                medicineName = medicine.getName();
                dosage = medicine.getDosage();
            } else {
                medicineName = "Unknown Medicine (" + medicineId + ")";
                dosage = "";
            }
        }

        History h = new History();
        h.setUserId(userId);
        h.setMedicineId(medicineId);
        h.setMedicineName(medicineName);
        h.setDosage(dosage);
        h.setActionType(actionType);

        int historyId = historyDAO.add(h);

        // Only reduce stock if it's literally marking as "Taken"
        if ("Taken".equalsIgnoreCase(actionType)) {
            medicineDAO.reduceQuantity(medicineId);
        }

        out.print("{\"success\": true, \"message\": \"History logged successfully\"}");
        out.flush();
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
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
        historyDAO.clearAll(userId);

        out.print("{\"success\": true, \"message\": \"History cleared\"}");
        out.flush();
    }

    private String escape(String str) {
        if (str == null) return "";
        return str.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
