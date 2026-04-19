package com.offershow.job.wiz.service.session;


import io.agentscope.core.session.Session;
import io.agentscope.core.state.SessionKey;
import io.agentscope.core.state.StateModule;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;

@Slf4j
public class UserSessionManager {

    private final String sessionId;
    private final SessionKey sessionKey;
    private final List<StateModule> components = new ArrayList<>();
    private Session session;

    private UserSessionManager(SessionKey sessionKey) {
        this.sessionKey = sessionKey;
        this.sessionId = sessionKey.toIdentifier();
    }

    public static UserSessionManager forSessionId(SessionKey sessionKey) {
        if (sessionKey == null) {
            throw new IllegalArgumentException("SessionKey cannot be null or empty");
        }
        return new UserSessionManager(sessionKey);
    }


    /**
     * Set the session implementation to use.
     *
     * <p>This method allows using any Session implementation, making the manager extensible for
     * different storage backends.
     *
     * @param session session instance
     * @return This SessionManager for chaining
     * @throws IllegalArgumentException if session is null
     */
    public UserSessionManager withSession(Session session) {
        if (session == null) {
            throw new IllegalArgumentException("Session cannot be null");
        }
        this.session = session;
        return this;
    }

    /**
     * Add a component to be managed.
     *
     * <p>Components will be saved and loaded using their saveTo/loadFrom methods.
     *
     * @param component The StateModule component to add
     * @return This SessionManager for chaining
     * @throws IllegalArgumentException if component is null
     */
    public UserSessionManager addComponent(StateModule component) {
        if (component == null) {
            throw new IllegalArgumentException("Component cannot be null");
        }
        components.add(component);
        return this;
    }

    /**
     * Load session state if the session exists.
     *
     * <p>This method will only load the state if a session with the given ID exists. If no session
     * exists, this method does nothing.
     *
     * @throws IllegalStateException if no session has been configured
     */
    public void loadIfExists() {
        Session session = checkAndGetSession();
        if (session.exists(sessionKey)) {
            for (StateModule component : components) {
                component.loadFrom(session, sessionKey);
            }
        }
    }

    /**
     * Load session state, throwing an exception if session doesn't exist.
     *
     * @throws IllegalStateException    if no session has been configured
     * @throws IllegalArgumentException if session doesn't exist
     */
    public void loadOrThrow() {
        Session session = checkAndGetSession();
        if (!session.exists(sessionKey)) {
            throw new IllegalArgumentException("Session not found: " + sessionId);
        }
        for (StateModule component : components) {
            component.loadFrom(session, sessionKey);
        }
    }

    /**
     * Save current component states to session storage.
     *
     * <p>This method saves the current state of all registered components. If the session doesn't
     * exist, it will be created.
     *
     * @throws IllegalStateException if no session has been configured
     */
    public void saveSession() {
        Session session = checkAndGetSession();
        for (StateModule component : components) {
            component.saveTo(session, sessionKey);
        }
    }

    /**
     * Save current component states to session storage with error handling.
     *
     * <p>This method saves the current state of all registered components and throws an exception if
     * the save operation fails.
     *
     * @throws IllegalStateException if no session has been configured
     * @throws RuntimeException      if save operation fails
     */
    public void saveOrThrow() {
        try {
            saveSession();
        } catch (Exception e) {
            throw new RuntimeException("Failed to save session: " + sessionId, e);
        }
    }

    /**
     * Save session state only if the session already exists.
     *
     * <p>This method only saves if a session with the given ID already exists. If no session exists,
     * this method does nothing.
     *
     * @throws IllegalStateException if no session has been configured
     */
    public void saveIfExists() {
        Session session = checkAndGetSession();
        if (session.exists(sessionKey)) {
            for (StateModule component : components) {
                component.saveTo(session, sessionKey);
            }
        }
    }

    /**
     * Check if the session exists.
     *
     * @return true if session exists, false otherwise
     * @throws IllegalStateException if no session has been configured
     */
    public boolean sessionExists() {
        Session session = checkAndGetSession();
        return session.exists(sessionKey);
    }

    /**
     * Get the configured session for advanced operations.
     *
     * @return The configured Session instance
     * @throws IllegalStateException if no session has been configured
     */
    public Session getSession() {
        return checkAndGetSession();
    }

    /**
     * Delete the session if it exists.
     *
     * @return true if session was deleted, false if it didn't exist
     * @throws IllegalStateException if no session has been configured
     */
    public boolean deleteIfExists() {
        Session session = checkAndGetSession();
        if (session.exists(sessionKey)) {
            session.delete(sessionKey);
            return true;
        }
        return false;
    }

    /**
     * Delete the session, throwing an exception if it doesn't exist.
     *
     * @throws IllegalStateException    if no session has been configured
     * @throws IllegalArgumentException if session doesn't exist
     */
    public void deleteOrThrow() {
        Session session = checkAndGetSession();
        if (!session.exists(sessionKey)) {
            throw new IllegalArgumentException("Session not found: " + sessionId);
        }
        session.delete(sessionKey);
    }

    private Session checkAndGetSession() {
        if (session == null) {
            throw new IllegalStateException("No session configured. Use withSession()");
        }
        return session;
    }


}
