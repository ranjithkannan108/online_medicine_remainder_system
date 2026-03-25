package com.medreminder.servlet;

import com.medreminder.dao.MedicineDAO;
import com.medreminder.model.Medicine;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

@WebServlet("/api/medicines")
public class MedicineServlet extends HttpServlet {

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
        List<Medicine> medicines = medicineDAO.getAllByUser(userId);

        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < medicines.size(); i++) {
            Medicine m = medicines.get(i);
            if (i > 0) json.append(",");
            json.append(medicineToJson(m));
        }
        json.append("]");

        out.print("{\"success\": true, \"medicines\": " + json.toString() + "}");
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

        Medicine med = new Medicine();
        med.setUserId(userId);
        med.setName(request.getParameter("name"));
        med.setDosage(request.getParameter("dosage"));
        med.setQuantity(Integer.parseInt(request.getParameter("quantity")));
        med.setFrequency(request.getParameter("frequency"));
        med.setStartDate(request.getParameter("startDate"));
        med.setEndDate(request.getParameter("endDate"));
        med.setTimes(request.getParameter("times"));
        med.setNotes(request.getParameter("notes"));
        String minStockParam = request.getParameter("minStockAlert");
        med.setMinStockAlert(minStockParam != null && !minStockParam.isEmpty() ? Integer.parseInt(minStockParam) : 5);

        int id = medicineDAO.add(med);
        if (id > 0) {
            out.print("{\"success\": true, \"id\": " + id + ", \"message\": \"Medicine added\"}");
        } else {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"success\": false, \"message\": \"Failed to add\"}");
        }
        out.flush();
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
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

        Medicine med = new Medicine();
        med.setId(Integer.parseInt(request.getParameter("id")));
        med.setName(request.getParameter("name"));
        med.setDosage(request.getParameter("dosage"));
        med.setQuantity(Integer.parseInt(request.getParameter("quantity")));
        med.setFrequency(request.getParameter("frequency"));
        med.setStartDate(request.getParameter("startDate"));
        med.setEndDate(request.getParameter("endDate"));
        med.setTimes(request.getParameter("times"));
        med.setNotes(request.getParameter("notes"));
        String minStockParam = request.getParameter("minStockAlert");
        med.setMinStockAlert(minStockParam != null && !minStockParam.isEmpty() ? Integer.parseInt(minStockParam) : 5);

        boolean updated = medicineDAO.update(med);
        if (updated) {
            out.print("{\"success\": true, \"message\": \"Medicine updated\"}");
        } else {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"success\": false, \"message\": \"Failed to update\"}");
        }
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

        int id = Integer.parseInt(request.getParameter("id"));
        boolean deleted = medicineDAO.delete(id);

        if (deleted) {
            out.print("{\"success\": true, \"message\": \"Medicine deleted\"}");
        } else {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"success\": false, \"message\": \"Failed to delete\"}");
        }
        out.flush();
    }

    private String medicineToJson(Medicine m) {
        return "{\"id\":" + m.getId()
                + ",\"userId\":" + m.getUserId()
                + ",\"name\":\"" + escape(m.getName()) + "\""
                + ",\"dosage\":\"" + escape(m.getDosage()) + "\""
                + ",\"quantity\":" + m.getQuantity()
                + ",\"frequency\":\"" + escape(m.getFrequency()) + "\""
                + ",\"startDate\":\"" + escape(m.getStartDate()) + "\""
                + ",\"endDate\":\"" + escape(m.getEndDate()) + "\""
                + ",\"times\":\"" + escape(m.getTimes()) + "\""
                + ",\"notes\":\"" + escape(m.getNotes()) + "\""
                + ",\"minStockAlert\":" + m.getMinStockAlert()
                + "}";
    }

    private String escape(String str) {
        if (str == null) return "";
        return str.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
