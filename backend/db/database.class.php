<?php 
class Database{
    private $MYSQL_HOST = 'localhost:3307';
    private $MYSQL_USER = 'root';
    private $MYSQL_PASS = '';
    private $MYSQL_DB = 'doot-socket';
    private $CHARSET = 'UTF8';
    private $COLLATION = 'utf8_general_ci';
    private $pdo = null;
    private $stmt=null;

    //db connection
    private function connectDB(){
        $SQL = "mysql:host=".$this->MYSQL_HOST.";dbname=".$this->MYSQL_DB;
        try {
            $this->pdo = new PDO($SQL,$this->MYSQL_USER,$this->MYSQL_PASS);
            $this->pdo->exec("SET NAMES '".$this->CHARSET."' COLLATE '".$this->COLLATION."'");
            $this->pdo->exec("SET CHARACTER SET '".$this->CHARSET."'");
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE,PDO::FETCH_OBJ);
           // echo "baglanti basarili";
        } catch (PDOException $e) {
            die("PDO ile veritabanina ulasilamadi.".$e->getMessage());
        }
    }

    //start connection w/ constructor.
    public function __construct(){
        $this->connectDB();
    }

    //query execution
    private function myQuery($query, $params = null) {
        try {
            if (is_null($params)) {
                $this->stmt = $this->pdo->query($query);
            } else {
                $this->stmt = $this->pdo->prepare($query);
                $this->stmt->execute($params);
            }
            return $this->stmt;
        } catch (PDOException $e) {
            echo "Query failed: " . $e->getMessage();
            return false;
        }
    }

     // Start a transaction
     public function beginTransaction() {
        $this->pdo->beginTransaction();
    }

    // Commit a transaction
    public function commit() {
        $this->pdo->commit();
    }

    // Rollback a transaction
    public function rollback() {
        $this->pdo->rollBack();
    }

    //insert function
    public function insertData($query,$params=null){
        try {
            $this->myQuery($query,$params);
            return $this->pdo->lastInsertId();
        } catch (PDOException $e) {
            echo $e->getMessage();
            return false;
        }
    }

    //update function
    public function updateData($query, $params = null) {
        try {
            $stmt = $this->myQuery($query, $params);
            return $stmt->rowCount();
        } catch (PDOException $e) {
            echo $e->getMessage();
            return false;
        }
    }

    public function deleteData($query, $params = null) {
        try {
            // Execute the query
            $stmt = $this->myQuery($query, $params);
    
            // Check if any rows were affected (i.e., deleted)
            if ($stmt) {
                $rowCount = $stmt->rowCount();
                if ($rowCount > 0) {
                    // Return the number of rows affected (i.e., deleted)
                    return $rowCount;
                } else {
                    // No rows were affected
                    return false;
                }
            } else {
                // Query execution failed
                return false;
            }
        } catch (PDOException $e) {
            echo $e->getMessage();
            return false;
        }
    }

    //get single row
    public function getRow($query, $params = null) {
        try {
            $stmt = $this->myQuery($query, $params);
            if ($stmt) {
                return $stmt->fetch(PDO::FETCH_ASSOC);
            }
            return false;
        } catch (PDOException $e) {
            echo "Query failed: " . $e->getMessage();
            return false;
        }
    }

    //gel all rows
    public function getRows($query, $params = null) {
        try {
            $stmt = $this->myQuery($query, $params);
            if ($stmt) {
                return $stmt->fetchAll(PDO::FETCH_ASSOC);
            }
            return false;
        } catch (PDOException $e) {
            echo "Query failed: " . $e->getMessage();
            return false;
        }
    }


    //shutdown of db-connection
    public function __destruct(){
        $this->pdo = NULL;
    }
}
?>